import { DragDropModule } from '@angular/cdk/drag-drop'
import { ENTER } from '@angular/cdk/keycodes'
import { CdkTreeModule } from '@angular/cdk/tree'
import { CommonModule } from '@angular/common'
import { ChangeDetectorRef, Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'
import { MatChipInputEvent } from '@angular/material/chips'
import { MatDialog } from '@angular/material/dialog'
import { MatExpansionModule } from '@angular/material/expansion'
import { Router, RouterModule } from '@angular/router'
import { AnalyticalCardModule } from '@metad/ocap-angular/analytical-card'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { NxSelectionModule, SlicersCapacity } from '@metad/components/selection'
import { AppearanceDirective, ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { Cube, DataSettings, getEntityDimensions, getEntityIndicators, getEntityMeasures, isIndicatorMeasureProperty, negate } from '@metad/ocap-core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NgmSemanticModel } from '@metad/cloud/state'
import { uuid, WidgetComponentType } from '@metad/story/core'
import { isPlainObject } from 'lodash-es'
import { firstValueFrom } from 'rxjs'
import { ToastrService } from '../../../@core'
import { CopilotEnableComponent, MaterialModule, StorySelectorComponent } from '../../../@shared'
import { InsightService } from './insight.service'
import { NgmEntityPropertyComponent } from '@metad/ocap-angular/entity'


@UntilDestroy({ checkProperties: true })
@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    CdkTreeModule,
    RouterModule,
    MaterialModule,
    MatExpansionModule,
    TranslateModule,
    DensityDirective,
    ButtonGroupDirective,
    NgmCommonModule,
    AppearanceDirective,
    AnalyticalCardModule,
    NxSelectionModule,
    NgmEntityPropertyComponent,

    CopilotEnableComponent
  ],
  selector: 'pac-home-insight',
  templateUrl: 'insight.component.html',
  styleUrls: ['insight.component.scss']
})
export class InsightComponent {
  separatorKeysCodes: number[] = [ENTER];
  SlicersCapacity = SlicersCapacity
  
  private _cdr = inject(ChangeDetectorRef)
  private _dialog = inject(MatDialog)
  private router = inject(Router)
  private translateService = inject(TranslateService)
  private _toastrService = inject(ToastrService)
  private insightService = inject(InsightService)

  @ViewChild('promptInput') promptInput: ElementRef<HTMLInputElement>;

  get model(): NgmSemanticModel {
    return this.insightService.model
  }
  get cube() {
    return this.insightService.cube
  }

  promptControl = new FormControl()

  get suggestedPrompts() {
    return this.insightService.suggestedPrompts
  }

  readonly answers = signal([])

  answering = false
  askController: AbortController

  get suggesting() {
    return this.insightService.suggesting
  }
  get error() {
    return this.insightService.error
  }

  public readonly copilotNotEnabled$ = this.insightService.copilotNotEnabled$
  readonly models$ = this.insightService.models$
  readonly hasCube$ = this.insightService.hasCube$
  readonly cubes$ = this.insightService.cubes$

  readonly entityType = this.insightService.entityType

  dimensions = computed(() => {
    if (this.entityType()) {
      return getEntityDimensions(this.entityType())
    }
    return null
  })

  measures = computed(() => {
    if (this.entityType()) {
      return getEntityMeasures(this.entityType()).filter(negate(isIndicatorMeasureProperty))
    }
    return null
  })

  indicators = computed(() => {
    if (this.entityType()) {
      return getEntityIndicators(this.entityType())
    }
    return null
  })

  showModel = signal(null)

  private promptControlSub = this.promptControl.valueChanges.subscribe(() => this.insightService.error = '')

  compareWithId(a, b) {
    return a?.id === b?.id
  }
  compareWithName(a, b) {
    return a?.name === b?.name
  }

  setPrompt(prompt: string) {
    this.promptControl.setValue(prompt)
  }

  async onModelChange(value: NgmSemanticModel) {
    await this.insightService.setModel(value)
    this._cdr.detectChanges()
  }

  async onCubeChange(cube: Cube) {
    await this.insightService.setCube(cube)
  }

  /**
   * Add an ask prompt
   * 
   * @param event 
   */
  async add(event: MatChipInputEvent) {
    // Prompt value
    const value = (event.value || '').trim();

    // Clear the input value
    event.chipInput!.clear();
    this.promptControl.setValue(null);

    if (value) {
      await this.askCopilot(value)
    }
  }

  selected(event: MatAutocompleteSelectedEvent) {
    this.promptInput.nativeElement.value = event.option.viewValue
    this.promptControl.setValue(event.option.viewValue)
  }

  removeAnswer(index: number) {
    this.answers().splice(index, 1)
    this.answers.set([...this.answers()])
  }

  /**
   * Ask copilot using prompt
   * 
   * @param prompt string
   */
  async askCopilot(prompt: string) {
    // Cancel prev ask request if any
    this.askController?.abort()
    this.askController = new AbortController()
    this.answering = true
    
    const _answer = {
      title: prompt,
      expanded: true,
      answering: true
    }

    // Append answer
    this.answers.set([
      ...this.answers(),
      _answer
    ])

    // Ask copilot
    const answer = await this.insightService.askCopilot(prompt, {
      signal: this.askController.signal
    })

    // Update answer
    const index = this.answers().indexOf(_answer)
    this.answers.set([
      ...this.answers().slice(0, index),
      {
        ..._answer,
        ...answer,
        expanded: true,
        answering: false
      },
      ...this.answers().slice(index + 1)
    ])

    this.answering = false
    this._cdr.detectChanges()
  }

  async addToStory(answer) {
    const addToStoryTitle = await firstValueFrom(this.translateService.get('PAC.Home.Insight.AddWidgetToStoryTitle', {Default: 'Add widget to story'}))
    const result = await firstValueFrom(this._dialog.open(StorySelectorComponent, {data: {
      title: addToStoryTitle,
      model: this.model,
      widget: {
        key: uuid(),
        name: answer.title,
        title: answer.title,
        component: WidgetComponentType.AnalyticalCard,
        dataSettings: {
          ...(answer.dataSettings ?? {}),
          selectionVariant: {
            selectOptions: answer.slicers
          }
        } as DataSettings,
        chartOptions: addAccordionWrapper(answer.chartOptions),
        slicers: answer.slicers,
        __showslicers__: true,
        position: {
          cols: 5, rows: 5,
        }
      }
    }}).afterClosed())
    
    if (result) {
      this._toastrService.info({
          code: 'PAC.MESSAGE.CreateStoryWidgetSuccess',
          default: 'Create story widget success'
        },
        {
          code: 'PAC.ACTIONS.Open',
          default: 'Open'
        },
        {
          duration: 5000
        }
      ).onAction().subscribe(() => {
        this.router.navigate([`/story/${result.storyId}`], {
          queryParams: {
            pageKey: result.pageKey,
            widgetKey: result.key,
          }
        })
      })
    }
  }
}

export function addAccordionWrapper(chartOptions) {
  const result = {}
  if (chartOptions) {
    Object.keys(chartOptions).map((key) => {
      if (isPlainObject(chartOptions[key])) {
        result[key] = addAccordionWrapper(chartOptions[key])
        result[`__show${key}__`] = true
      } else {
        result[key] = chartOptions[key]
      }
    })

    return result
  } else {
    return chartOptions
  }
}
