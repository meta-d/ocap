import { Signal, inject } from '@angular/core'
import { CopilotAgentType, referencesCommandName } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { DataSettings } from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { injectExampleRetriever } from 'apps/cloud/src/app/@core/copilot'
import { NGXLogger } from 'ngx-logger'
import { injectCreateCalculationGraph } from './graph'
import {
  CALCULATION_COMMAND_NAME,
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

  const referencesRetriever = injectExampleRetriever(referencesCommandName(CALCULATION_COMMAND_NAME), {
    k: 3,
    vectorStore: null
  })
  return injectCopilotCommand(CALCULATION_COMMAND_NAME, {
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
      ],
      referencesRetriever
    },
    createGraph
  })
}
