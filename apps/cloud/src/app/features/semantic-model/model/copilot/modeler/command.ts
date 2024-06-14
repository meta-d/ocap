import { inject } from '@angular/core'
import { Runnable } from '@langchain/core/runnables'
import { ChatOpenAI } from '@langchain/openai'
import { CopilotAgentType } from '@metad/copilot'
import { NgmCopilotService, injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { SemanticModelService } from '../../model.service'
import { createModelerGraph } from './graph'

export function injectModelerCommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const modelService = inject(SemanticModelService)
  const copilotService = inject(NgmCopilotService)

  const commandName = 'modeler'

  return injectCopilotCommand(commandName, {
    alias: 'm',
    description: 'Modeling command for semantic model',
    agent: {
      type: CopilotAgentType.Graph
    },
    createGraph: async (llm: ChatOpenAI) => {
      return (await createModelerGraph(llm)) as unknown as Runnable
    }
  })
}
