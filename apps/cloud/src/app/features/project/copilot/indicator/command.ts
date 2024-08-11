import { inject } from '@angular/core'
import { CopilotAgentType, referencesCommandName } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { injectExampleRetriever } from 'apps/cloud/src/app/@core/copilot'
import { injectCreateIndicatorGraph } from './graph'
import { INDICATOR_AGENT_NAME } from './types'

export function injectIndicatorCommand() {
  const translate = inject(TranslateService)
  const createGraph = injectCreateIndicatorGraph()

  const commandName = 'indicator'
  const referencesRetriever = injectExampleRetriever(referencesCommandName('calculated'), { k: 3, vectorStore: null })
  return injectCopilotCommand(commandName, {
    alias: 'i',
    description: translate.instant('PAC.INDICATOR.CommandIndicatorDesc', {
      Default: 'Descripe the indicator business logic'
    }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: [INDICATOR_AGENT_NAME],
      referencesRetriever
    },
    createGraph
  })
}
