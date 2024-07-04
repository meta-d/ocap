import { inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { injectCreateIndicatorGraph } from './graph'
import { INDICATOR_AGENT_NAME } from './types'

export function injectIndicatorCommand() {
  const translate = inject(TranslateService)
  const createGraph = injectCreateIndicatorGraph()

  const commandName = 'indicator'
  return injectCopilotCommand(commandName, {
    alias: 'i',
    description: translate.instant('PAC.INDICATOR.CommandIndicatorDesc', {
      Default: 'Descripe the indicator business logic'
    }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: [INDICATOR_AGENT_NAME]
    },
    createGraph
  })
}
