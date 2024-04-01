import { CdkDragDrop } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild, computed, effect, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { BaseEditorDirective } from '@metad/components/editor'
import { CalculatedMeasureComponent } from '@metad/components/property'
import { calcEntityTypePrompt, makeCubePrompt } from '@metad/core'
import { injectCopilotCommand, injectMakeCopilotActionable } from '@metad/ocap-angular/copilot'
import { DisplayDensity } from '@metad/ocap-angular/core'
import { NgmFormulaModule } from '@metad/ocap-angular/formula'
import { C_MEASURES, CalculatedMember, Syntax, stringifyProperty } from '@metad/ocap-core'
import { getSemanticModelKey } from '@metad/story/core'
import { ContentLoaderModule } from '@ngneat/content-loader'
import { TranslateModule } from '@ngx-translate/core'
import { isNil, negate } from 'lodash-es'
import { NGXLogger } from 'ngx-logger'
import { computedAsync } from 'ngxtension/computed-async'
import { injectParams } from 'ngxtension/inject-params'
import { EMPTY } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { Store, ToastrService, uuid } from '../../../../../@core'
import { MaterialModule, TranslationBaseComponent } from '../../../../../@shared/'
import { AppService } from '../../../../../app.service'
import { CalculatedMeasureSchema, zodToAnnotations } from '../../copilot'
import { SemanticModelService } from '../../model.service'
import { MODEL_TYPE, ModelDesignerType } from '../../types'
import { ModelEntityService } from '../entity.service'
import { getDropProperty } from '../types'

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
  ModelType = MODEL_TYPE

  public readonly appService = inject(AppService)
  public readonly modelService = inject(SemanticModelService)
  public readonly entityService = inject(ModelEntityService)
  readonly #route = inject(ActivatedRoute)
  readonly #router = inject(Router)
  readonly #logger = inject(NGXLogger)
  readonly #store = inject(Store)
  readonly #toastr = inject(ToastrService)

  @ViewChild('editor') editor!: BaseEditorDirective

  readonly params = injectParams()
  readonly key = computed(() => this.params()?.id)

  public readonly options$ = this.modelService.wordWrap$.pipe(map((wordWrap) => ({ wordWrap })))

  /**
  |--------------------------------------------------------------------------
  | Signals
  |--------------------------------------------------------------------------
  */
  readonly cube = this.entityService.cube
  readonly isMobile = toSignal(this.appService.isMobile$)

  readonly calculatedMember = computedAsync(() => {
    if (this.key()) {
      return this.entityService.selectCalculatedMember(this.key())
    }

    return EMPTY
  })

  readonly formula = computed(() => this.calculatedMember()?.formula)
  readonly entityType = this.entityService.entityType
  readonly syntax = computed(() => this.entityType().syntax)

  private readonly modelKey = toSignal(this.modelService.model$.pipe(map(getSemanticModelKey)))
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
  readonly selectedProperty = this.entityService.selectedProperty
  readonly typeKey = computed(() => `${ModelDesignerType.calculatedMember}#${this.key()}`)

  /**
  |--------------------------------------------------------------------------
  | Copilot
  |--------------------------------------------------------------------------
  */
  #calculatedMeasureCommand = injectCopilotCommand({
    name: 'formula',
    description: 'Create or edit a calculated member',
    systemPrompt: () => {
      let prompt = `Create a new or edit (if there is a formula) MDX calculated measure for the cube based on the prompt.`
      if (this.entityType()) {
        prompt += `The cube is: 
\`\`\`
${calcEntityTypePrompt(this.entityType())}
\`\`\`
`
      } else {
        prompt += `The cube is:
\`\`\`
${makeCubePrompt(this.cube())}
\`\`\`
`
      }
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

          return `✅`
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

          return `✅`
        }
      })
    ]
  })

  /**
  |--------------------------------------------------------------------------
  | Subscribers
  |--------------------------------------------------------------------------
  */

  constructor() {
    super()

    effect(
      () => {
        this.entityService.setSelectedProperty(this.typeKey())
      },
      { allowSignalWrites: true }
    )
  }

  /**
  |--------------------------------------------------------------------------
  | Methods
  |--------------------------------------------------------------------------
  */
  trackByIndex(index: number, el: any): number {
    return index
  }

  setFormula(formula: string) {
    const calculatedMember = this.calculatedMember()
    if (this.modelType() === MODEL_TYPE.OLAP) {
      if (isNil(calculatedMember)) {
        // this.#toastr.error(`请先选择一个计算成员`)
        return
      }
    }
    // null and "" as the same
    if (!isNil(calculatedMember) && (!formula !== !calculatedMember?.formula || !!formula)) {
      this.entityService.setCalculatedMember({
        ...calculatedMember,
        formula
      })
    } else {
      // this.entityService.setEntityExpression(formula)
    }
  }

  dropEntity(event) {
    this.editor.insert(event.item.data?.name)
  }

  dropFormula(event: CdkDragDrop<any[]>) {
    const previousItem = event.item.data
    const index = event.currentIndex
    if (event.previousContainer.id === 'list-dimensions') {
      const item = getDropProperty(event, this.modelType(), this.dialect())
      this.setFormula(`${this.formula()}${stringifyProperty(item)}`)
    }
  }

  onEditorKeyDown(event) {
    console.log(event)
  }

  ngOnDestroy(): void {
    if (this.selectedProperty() === this.typeKey()) {
      this.entityService.setSelectedProperty(null)
    }
  }
}
