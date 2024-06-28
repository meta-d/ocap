import { inject } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { IndicatorFormulaSchema } from '@metad/core'
import { NGXLogger } from 'ngx-logger'
import { IndicatorRegisterComponent } from '../../indicators/register/register.component'

export function injectModifyFormulaTool() {
  const logger = inject(NGXLogger)
  const indicatorComponent = inject(IndicatorRegisterComponent)

  const modifyFormulaTool = new DynamicStructuredTool({
    name: 'modifyFormula',
    description: 'Modify formula for the indicator.',
    schema: IndicatorFormulaSchema,
    func: async ({ formula, unit }) => {
      logger.debug(`Execute copilot tool 'modifyFormula':`, `formula:`, formula, `unit:`, unit)

      indicatorComponent.updateIndicator({ formula, unit })

      return `The formula of indicator has changed to "${formula}" and unit "${unit || ''}"!`
    }
  })

  return modifyFormulaTool
}
