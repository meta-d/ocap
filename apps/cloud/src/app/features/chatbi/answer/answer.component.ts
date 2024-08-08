import { ClipboardModule } from '@angular/cdk/clipboard'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, input, ViewContainerRef } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatTooltipModule } from '@angular/material/tooltip'
import { Router, RouterModule } from '@angular/router'
import { CopilotChatMessage, JSONValue, nanoid } from '@metad/copilot'
import { AnalyticalCardModule } from '@metad/ocap-angular/analytical-card'
import { AnalyticalGridModule } from '@metad/ocap-angular/analytical-grid'
import { NgmDisplayBehaviourComponent } from '@metad/ocap-angular/common'
import { DensityDirective, DisplayDensity } from '@metad/ocap-angular/core'
import { NgmCalculationEditorComponent } from '@metad/ocap-angular/entity'
import { NgmSelectionModule, SlicersCapacity } from '@metad/ocap-angular/selection'
import { CalculatedProperty, CalculationType, DataSettings, Indicator, ISlicer, isString, Syntax } from '@metad/ocap-core'
import { WidgetComponentType } from '@metad/story/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { MarkdownModule } from 'ngx-markdown'
import { firstValueFrom } from 'rxjs'
import { Store, ToastrService } from '../../../@core'
import { StorySelectorComponent } from '../../../@shared'
import { ChatbiService } from '../chatbi.service'
import { ChatbiHomeComponent } from '../home.component'
import { QuestionAnswer } from '../types'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    ClipboardModule,
    MarkdownModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatInputModule,
    MatMenuModule,
    DensityDirective,
    NgmDisplayBehaviourComponent,

    AnalyticalCardModule,
    AnalyticalGridModule,
    NgmSelectionModule
  ],
  selector: 'pac-chatbi-answer',
  templateUrl: 'answer.component.html',
  styleUrl: 'answer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatbiAnswerComponent {
  SlicersCapacity = SlicersCapacity
  DisplayDensity = DisplayDensity

  readonly chatbiService = inject(ChatbiService)
  readonly #logger = inject(NGXLogger)
  readonly homeComponent = inject(ChatbiHomeComponent)
  readonly #translate = inject(TranslateService)
  readonly #dialog = inject(MatDialog)
  readonly #toastr = inject(ToastrService)
  readonly router = inject(Router)
  readonly #store = inject(Store)
  readonly #viewContainerRef = inject(ViewContainerRef)

  readonly message = input<CopilotChatMessage>(null)
  readonly primaryTheme = toSignal(this.#store.primaryTheme$)
  readonly model = this.chatbiService.model
  readonly indicators = computed(() => {
    const indicators = this.chatbiService.indicators()
    return indicators?.reduce((result, indicator) => {
      result[indicator.id] = indicator
      return result
    }, {})
  })

  readonly charts = computed(() =>
    this.toArray(this.message().data).map((item) => {
      if (this.typeof(item) === 'object' && this.isAnswer(item)) {
        return {
          chartSettings: this.toChartSettings(item as unknown as QuestionAnswer)
        }
      }
    })
  )

  toArray(data: JSONValue) {
    return (Array.isArray(data) ? data : []) as Array<string | QuestionAnswer>
  }

  typeof(data: string | QuestionAnswer) {
    return typeof data
  }

  trackByKey(item: string | QuestionAnswer) {
    return isString(item) ? item : item.key
  }

  onCopy(copyButton) {
    copyButton.copied = true
    setTimeout(() => {
      copyButton.copied = false
    }, 3000)
  }

  isAnswer(value: string | QuestionAnswer): QuestionAnswer {
    return value as unknown as QuestionAnswer
  }

  openExplore(item: string | QuestionAnswer) {
    this.homeComponent.openExplore(this.message(), item as unknown as QuestionAnswer)
  }

  toGrid(dataSettings: DataSettings) {
    return {
      ...dataSettings,
      analytics: {
        rows: dataSettings.chartAnnotation.dimensions,
        columns: dataSettings.chartAnnotation.measures
      }
    } as DataSettings
  }

  toChartSettings(item: QuestionAnswer) {
    return {
      ...(item.chartSettings ?? {}),
      theme: this.primaryTheme()
    }
  }

  async addToStory(answer: QuestionAnswer) {
    const addToStoryTitle = this.#translate.instant('PAC.Home.Insight.AddWidgetToStoryTitle', {
      Default: 'Add widget to story'
    })
    const result = await firstValueFrom(
      this.#dialog
        .open(StorySelectorComponent, {
          data: {
            title: addToStoryTitle,
            model: this.model(),
            widget: {
              key: nanoid(),
              name: answer.title,
              title: answer.title,
              component: WidgetComponentType.AnalyticalCard,
              dataSettings: {
                ...(answer.dataSettings ?? {}),
                selectionVariant: {
                  selectOptions: answer.slicers
                }
              } as DataSettings,
              chartOptions: answer.chartOptions,
              slicers: answer.slicers,
              __showslicers__: true,
              position: {
                cols: 5,
                rows: 5
              }
            }
          }
        })
        .afterClosed()
    )

    if (result) {
      this.#toastr
        .info(
          {
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
        )
        .onAction()
        .subscribe(() => {
          this.router.navigate([`/story/${result.storyId}/edit`], {
            queryParams: {
              pageKey: result.pageKey,
              widgetKey: result.key
            }
          })
        })
    }
  }

  openIndicator(indicator: Indicator, answer: QuestionAnswer) {
    this.#dialog
      .open(NgmCalculationEditorComponent, {
        viewContainerRef: this.#viewContainerRef,
        data: {
          dataSettings: answer.dataSettings,
          entityType: this.chatbiService.entityType(),
          syntax: Syntax.MDX,
          value: {
            name: indicator.code,
            caption: indicator.name,
            calculationType: CalculationType.Calculated,
            formula: indicator.formula,
            formatting: {
              unit: indicator.unit
            }
          } as CalculatedProperty
        }
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.chatbiService.upsertIndicator({
            ...indicator,
            code: result.name,
            name: result.caption,
            formula: result.formula,
            unit: result.formatting?.unit
          })
        }
      })
  }

  updateSlicers(slicers: ISlicer[]) {
    this.chatbiService.updateQuestionAnswer(this.message().id, { slicers })
  }
}
