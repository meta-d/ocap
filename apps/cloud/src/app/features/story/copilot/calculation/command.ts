import { Signal, inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { DataSettings } from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { injectCreateCalculationGraph } from './graph'
import {
  CONDITIONAL_AGGREGATION_AGENT_NAME,
  FORMULA_AGENT_NAME,
  MEASURE_CONTROL_AGENT_NAME,
  RESTRICTED_AGENT_NAME,
  VARIANCE_AGENT_NAME
} from './types'

export function injectCalculationGraphCommand(
  defaultDataSettings: Signal<DataSettings & { modelId: string }>,
  callback: (dataSettings: DataSettings, key: string) => void
) {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)

  const createGraph = injectCreateCalculationGraph(defaultDataSettings, callback)

  const commandName = 'calculation'
  return injectCopilotCommand(commandName, {
    alias: 'cc',
    description: translate.instant('PAC.Story.CommandCalculationDesc', {
      Default: 'Describe logic of the calculation you want'
    }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: [
        FORMULA_AGENT_NAME,
        RESTRICTED_AGENT_NAME,
        CONDITIONAL_AGGREGATION_AGENT_NAME,
        VARIANCE_AGENT_NAME,
        MEASURE_CONTROL_AGENT_NAME
      ]
    },
    createGraph
  })
}
