import { inject } from '@angular/core'
import { StateGraph } from '@langchain/langgraph/web'
import { ChatOpenAI } from '@langchain/openai'
import { CopilotAgentType } from '@metad/copilot'
import { NgmCopilotService, injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { SemanticModelService } from '../../model.service'
import { injectCubeModeler } from '../cube/graph'
import { injectDimensionModeler } from '../dimension/graph'
import { createModelerGraph } from './graph'
import { injectSelectTablesTool } from './tools'

export function injectModelerCommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const modelService = inject(SemanticModelService)
  const copilotService = inject(NgmCopilotService)
  const createDimensionModeler = injectDimensionModeler()
  const createCubeModeler = injectCubeModeler()
  const selectTablesTool = injectSelectTablesTool()

  const dimensions = modelService.dimensions

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
      const dimensionModeler = await createDimensionModeler(llm)
      const cubeModeler = await createCubeModeler(llm)
      return (await createModelerGraph({
        llm,
        dimensionModeler,
        cubeModeler,
        selectTablesTool,
        dimensions
      })) as unknown as StateGraph<unknown>
    }
  })
}
