import { inject, signal } from '@angular/core'
import { ChatOpenAI } from '@langchain/openai'
import { CopilotAgentType } from '@metad/copilot'
import { NgmCopilotService, injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { SemanticModelService } from '../../model.service'
import { createModelerGraph } from './graph'
import { injectDimensionModeler } from '../dimension/graph'
import { injectCubeModeler } from '../cube/graph'
import { StateGraph } from '@langchain/langgraph/web'

export function injectModelerCommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const modelService = inject(SemanticModelService)
  const copilotService = inject(NgmCopilotService)
  const dimensionModeler = injectDimensionModeler()
  const cubeModeler = injectCubeModeler()

  const commandName = 'modeler'

  return injectCopilotCommand(commandName, {
    alias: 'm',
    description: 'Modeling command for semantic model',
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true
    },
    historyCursor: () => {
      return modelService.getHistoryCursor()
    },
    revert: async (index: number) => {
      modelService.gotoHistoryCursor(index)
    },
    createGraph: async (llm: ChatOpenAI) => {
      const dimensionModelerAgent = await dimensionModeler(llm)
      const cubeModelerAgent = await cubeModeler(llm)
      return (await createModelerGraph(llm, dimensionModelerAgent, cubeModelerAgent)) as unknown as StateGraph<unknown>
    }
  })
}
