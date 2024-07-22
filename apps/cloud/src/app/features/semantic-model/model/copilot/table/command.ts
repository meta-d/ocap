import { inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { injectAgentFewShotTemplate } from '../../../../../@core/copilot'
import { SemanticModelService } from '../../model.service'
import { injectTableCreator } from './graph'

export function injectTableCommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const modelService = inject(SemanticModelService)
  const createTableCreator = injectTableCreator()

  const commandName = 'table'
  const fewShotPrompt = injectAgentFewShotTemplate(commandName, { k: 1, vectorStore: null })
  return injectCopilotCommand(commandName, {
    alias: 't',
    description: translate.instant('PAC.MODEL.Copilot.CommandTableDesc', {
      Default: 'Descripe structure or business logic of the table'
    }),
    historyCursor: () => {
      return modelService.getHistoryCursor()
    },
    revert: async (index: number) => {
      modelService.gotoHistoryCursor(index)
    },
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: ['tools']
    },
    fewShotPrompt,
    createGraph: createTableCreator
  })
}
