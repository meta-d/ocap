import { inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { injectAgentFewShotTemplate } from '../../@core/copilot'
import { injectCreateChatAgent } from './graph'

export function injectChatCommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const createChartAgent = injectCreateChatAgent()

  const commandName = 'chat'
  const fewShotPrompt = injectAgentFewShotTemplate(commandName, { k: 1, vectorStore: null })
  return injectCopilotCommand(commandName, {
    description: translate.instant('PAC.MODEL.Copilot.CommandDBADesc', {
      Default: 'Describe the requirements for chat'
    }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: []
    },
    fewShotPrompt,
    createGraph: createChartAgent
  })
}
