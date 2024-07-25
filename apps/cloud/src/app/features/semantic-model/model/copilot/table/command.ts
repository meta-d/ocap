import { inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { injectAgentFewShotTemplate, injectExampleRetriever } from '../../../../../@core/copilot'
import { injectTableCreator } from './graph'
import { TABLE_COMMAND_NAME } from './types'

export function injectTableCommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const createTableCreator = injectTableCreator()

  const examplesRetriever = injectExampleRetriever(TABLE_COMMAND_NAME, { k: 5, score: 0.8, vectorStore: null })
  const fewShotPrompt = injectAgentFewShotTemplate(TABLE_COMMAND_NAME, { k: 1, vectorStore: null })
  return injectCopilotCommand(TABLE_COMMAND_NAME, {
    alias: 't',
    description: translate.instant('PAC.MODEL.Copilot.CommandTableDesc', {
      Default: 'Descripe structure or business logic of the table'
    }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: ['tools']
    },
    fewShotPrompt,
    examplesRetriever,
    createGraph: createTableCreator
  })
}
