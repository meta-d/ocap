import { inject } from '@angular/core'
import { BaseMessage } from '@langchain/core/messages'
import { StateGraphArgs } from '@langchain/langgraph/web'
import { ChatOpenAI } from '@langchain/openai'
import { NgmCopilotService } from '@metad/copilot-angular'
import { SemanticModelService } from '../../model.service'
import { markdownSharedDimensions } from '../dimension/types'
import { createCommandAgent } from '../langgraph-helper-utilities'
import { SYSTEM_PROMPT } from './cube.command'
import { injectCreateCubeTool } from './tools'
import { injectQueryTablesTool, injectSelectTablesTool } from '../tools'

export const CUBE_MODELER_NAME = 'CubeModeler'

interface CubeState {
  messages: BaseMessage[]
}

const cubeState: StateGraphArgs<CubeState>['channels'] = {
  messages: {
    value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: () => []
  }
}

export function injectCubeModeler() {
  const modelService = inject(SemanticModelService)
  const copilotService = inject(NgmCopilotService)

  const createCubeTool = injectCreateCubeTool()
  const selectTablesTool = injectSelectTablesTool()
  const queryTablesTool = injectQueryTablesTool()

  const dimensions = modelService.dimensions
  const cubes = modelService.cubes

  const systemContext = async () => {
    const sharedDimensions = dimensions().filter((dimension) => dimension.hierarchies?.length)
    return copilotService.rolePrompt() + 
      ` The cube name can't be the same as the fact table name.` + 
      (cubes().length ? ` The cube name cannot be any of the following existing cubes [${cubes().map(({name}) => name).join(', ')}]` : '') + 
` There is no need to create as dimension with those table fields that are already used in 'dimensionUsages'.` +
(sharedDimensions.length ? ` The cube can fill the source field in dimensionUsages only within the name of shared dimensions:
\`\`\`
${markdownSharedDimensions(sharedDimensions)}
\`\`\`
` : '')
  }

  return async (llm: ChatOpenAI) => {
    // const superGraph = new StateGraph({ channels: cubeState })
    //   // Add steps nodes
    //   .addNode(PLANNER_NAME, runPlanner)

    const agent = await createCommandAgent(llm, [
      selectTablesTool,
      queryTablesTool,
      createCubeTool
    ], SYSTEM_PROMPT, systemContext)
    
    return agent
  }
}
