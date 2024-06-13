import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Inject, Input, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MAT_DIALOG_DATA } from '@angular/material/dialog'
import { NgmCopilotChatComponent, NgmCopilotEngineService, injectCopilotCommand, injectMakeCopilotActionable } from '@metad/copilot-angular'
import { ButtonGroupDirective } from '@metad/ocap-angular/core'
import { NgmFormulaModule } from '@metad/ocap-angular/formula'
import { DataSettings, EntityType, PropertyMeasure, Syntax } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { Store } from '../../@core'
import { MaterialModule } from '../material.module'
import { NGXLogger } from 'ngx-logger'

/**
 * @deprecated 应该没有在用了
 */
@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    NgmFormulaModule,
    ButtonGroupDirective,
    NgmCopilotChatComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-model-formula',
  templateUrl: 'formula.component.html',
  styleUrls: ['formula.component.scss'],
  providers: [ NgmCopilotEngineService ]
})
export class ModelFormulaComponent {
  readonly #store = inject(Store)
  readonly #logger = inject(NGXLogger)

  Syntax = Syntax

  @Input() dataSettings: DataSettings
  @Input() entityType: EntityType
  @Input() measure: Partial<PropertyMeasure>

  searchControl = new FormControl('')

  get highlight() {
    return this.searchControl.value
  }
  get syntax() {
    return this.entityType?.syntax
  }

  formula = ''

  readonly themeName = toSignal(this.#store.primaryTheme$)

  #newFormula = injectMakeCopilotActionable({
    name: 'new_formula',
    description: 'New formula for measure',
    argumentAnnotations: [
      {
        name: 'formula',
        type: 'string',
        description: 'The formula to be used for the measure',
        required: true
      }
    ],
    implementation: async (formula: string) => {
      this.#logger.debug(`Copilot make formula is: ${formula}`)
      this.formula = formula
      return `The formula for the measure has been set to: ${formula}`
    }
  })

  #formatFormula = injectCopilotCommand({
    name: 'format',
    description: '',
    systemPrompt: async () => {
      return `Format the MDX formula:
\`\`\`
${this.formula}
\`\`\`
`
    },
    actions: [
      injectMakeCopilotActionable({
        name: 'format_formula',
        description: 'Format the formula',
        argumentAnnotations: [
          {
            name: 'formula',
            type: 'string',
            description: 'The formula to be formatted',
            required: true
          }
        ],
        implementation: async (formula: string) => {
          this.#logger.debug('Copilot format formula')
          this.formula = formula
          return `The formula has been formatted`
        }
      })
    ]
  })

  constructor(
    @Inject(MAT_DIALOG_DATA)
    private data: {
      dataSettings: DataSettings
      entityType: EntityType
      measure: Partial<PropertyMeasure>
      formula: string
    }
  ) {
    this.dataSettings = data.dataSettings
    this.entityType = data.entityType
    this.measure = data.measure
    this.formula = data.formula
  }
}
