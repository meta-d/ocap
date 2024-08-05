import { inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { injectAgentFewShotTemplate } from '../../../../../@core/copilot'
import { injectDBACreator } from './graph'
import { TABLE_CREATOR_NAME } from '../table/types'

export function injectDBACommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const createDBA = injectDBACreator()

  const commandName = 'dba'
  const fewShotPrompt = injectAgentFewShotTemplate(commandName, { k: 1, vectorStore: null })
  return injectCopilotCommand(commandName, {
    description: translate.instant('PAC.MODEL.Copilot.CommandDBADesc', {
      Default: 'Describe the requirements for database management'
    }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: [TABLE_CREATOR_NAME]
    },
    fewShotPrompt,
    createGraph: createDBA
  })
}
