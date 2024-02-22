import { CdkDragDrop } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild, computed, inject } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { BaseEditorDirective } from '@metad/components/editor'
import { CalculatedMeasureComponent } from '@metad/components/property'
import { calcEntityTypePrompt, nonBlank } from '@metad/core'
import { injectCopilotCommand, injectMakeCopilotActionable } from '@metad/ocap-angular/copilot'
import { DisplayDensity } from '@metad/ocap-angular/core'
import { NgmFormulaModule } from '@metad/ocap-angular/formula'
import { C_MEASURES, CalculatedMember, EntityType, Syntax } from '@metad/ocap-core'
import { ContentLoaderModule } from '@ngneat/content-loader'
import { TranslateModule } from '@ngx-translate/core'
import { isNil, negate } from 'lodash-es'
import { NGXLogger } from 'ngx-logger'
import { filter, map, startWith, switchMap } from 'rxjs/operators'
import { Store, uuid } from '../../../../../@core'
import { MaterialModule, TranslationBaseComponent } from '../../../../../@shared/'
import { AppService } from '../../../../../app.service'
import { CalculatedMeasureSchema, zodToAnnotations } from '../../copilot'
import { SemanticModelService } from '../../model.service'
import { ModelDesignerType } from '../../types'
import { ModelEntityService } from '../entity.service'

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-model-entity-calculation',
  templateUrl: './calculation.component.html',
  styleUrls: ['./calculation.component.scss'],
  host: {
    class: 'pac-model-entity-calculation'
  },
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    TranslateModule,
    ContentLoaderModule,
    NgmFormulaModule,

    CalculatedMeasureComponent
  ]
})
export class ModelEntityCalculationComponent extends TranslationBaseComponent implements OnDestroy {
  DisplayDensity = DisplayDensity
  Syntax = Syntax

  public readonly appService = inject(AppService)
  public readonly modelService = inject(SemanticModelService)
  public readonly entityService = inject(ModelEntityService)
  readonly #route = inject(ActivatedRoute)
  readonly #router = inject(Router)
  readonly #logger = inject(NGXLogger)
  readonly #store = inject(Store)

  @ViewChild('editor') editor!: BaseEditorDirective

  readonly #key$ = this.#route.paramMap.pipe(
    startWith(this.#route.snapshot.paramMap),
    map((paramMap) => paramMap.get('id'))
  )

  public readonly options$ = this.modelService.wordWrap$.pipe(map((wordWrap) => ({ wordWrap })))
  public readonly isMobile$ = this.appService.isMobile$

  /**
  |--------------------------------------------------------------------------
  | Signals
  |--------------------------------------------------------------------------
  */
  readonly key = toSignal(this.#key$)
  readonly calculatedMember = toSignal(
    this.#key$.pipe(
      filter(nonBlank),
      switchMap((id) => this.entityService.selectCalculatedMember(id))
    ),
    { initialValue: null }
  )
  readonly formula = computed(() => this.calculatedMember()?.formula)
  public readonly entityType = toSignal<EntityType, EntityType>(this.entityService.entityType$, {
    initialValue: { syntax: Syntax.MDX, properties: {} } as EntityType
  })
  public readonly syntax = computed(() => this.entityType().syntax)

  private readonly modelKey = toSignal(this.modelService.model$.pipe(map((model) => model.key ?? model.name)))
  private readonly cubeName = toSignal(
    this.entityService.cube$.pipe(
      map((cube) => cube?.name),
      filter(negate(isNil))
    )
  )

  public readonly dataSettings = computed(() => ({
    dataSource: this.modelKey(),
    entitySet: this.cubeName()
  }))

  readonly modelType = toSignal(this.modelService.modelType$)
  readonly dialect = toSignal(this.modelService.dialect$)

  /**
  |--------------------------------------------------------------------------
  | Copilot
  |--------------------------------------------------------------------------
  */
  #calculatedMeasureCommand = injectCopilotCommand({
    name: 'formula',
    description: 'Create a new calculated member',
    examples: [`Create a new calculated member`],
    systemPrompt: () => {
      let prompt = `Create or edit MDX calculated measure for the cube based on the prompt.
The cube is: ${calcEntityTypePrompt(this.entityType())}.`
      if (this.key()) {
        prompt += `The formula is "${this.formula()}"`
      }
      return prompt
    },
    actions: [
      injectMakeCopilotActionable({
        name: 'create-calculated-measure',
        description: 'Should always be used to properly format output',
        argumentAnnotations: [
          {
            name: 'measure',
            type: 'object', // Add or change types according to your needs.
            description: 'The defination of calculated measure',
            required: true,
            properties: zodToAnnotations(CalculatedMeasureSchema)
          }
        ],
        implementation: async (cm: CalculatedMember) => {
          this.#logger.debug(`Create a new calculated measure '${cm.name}' with formula '${cm.formula}'`)
          const key = cm.__id__ ?? uuid()
          this.entityService.addCalculatedMeasure({
            ...cm,
            dimension: C_MEASURES,
            __id__: key
          })

          this.entityService.navigateCalculation(key)
        }
      }),
      injectMakeCopilotActionable({
        name: 'edit-calculated-measure',
        description: 'Should always be used to properly format output',
        argumentAnnotations: [
          {
            name: 'formula',
            type: 'string', // Add or change types according to your needs.
            description: 'The defination of calculated measure',
            required: true
          }
        ],
        implementation: async (formula: string) => {
          this.#logger.debug(`Edit current calculated measure '${this.formula()}' to '${formula}'`)
          this.entityService.updateCubeProperty({
            type: ModelDesignerType.calculatedMember,
            id: this.key(),
            model: {
              formula
            }
          })
        }
      })
    ]
  })

  /**
  |--------------------------------------------------------------------------
  | Subscribers
  |--------------------------------------------------------------------------
  */
  private keySub = this.#key$.pipe(takeUntilDestroyed()).subscribe((key) => {
    this.entityService.patchState({
      currentCalculatedMember: key
    })
  })

  /**
  |--------------------------------------------------------------------------
  | Methods
  |--------------------------------------------------------------------------
  */
  trackByIndex(index: number, el: any): number {
    return index
  }

  async setFormula(formula: string) {
    const calculatedMember = this.calculatedMember()
    if (!isNil(calculatedMember) && formula !== calculatedMember?.formula) {
      this.entityService.setCalculatedMember({
        ...calculatedMember,
        formula
      })
    } else {
      // this.entityService.setEntityExpression(formula)
    }
  }

  onDesignerDrawerChange(opened) {}

  dropEntity(event) {
    this.editor.insert(event.item.data?.name)
  }

  dropFormula(event: CdkDragDrop<any[]>) {
    const previousItem = event.item.data
    const index = event.currentIndex
    console.log(previousItem)
    if (event.previousContainer.id === 'list-dimensions') {
      // const item = this.getDropProperty(event)
      // this.setFormula(`${this.formula()}${stringifyProperty(item)}`)
    }
  }

  onEditorKeyDown(event) {
    console.log(event)
  }

  ngOnDestroy(): void {
    this.entityService.patchState({
      currentCalculatedMember: null
    })
  }
}
