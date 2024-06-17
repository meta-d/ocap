import { inject } from '@angular/core'
import { BaseMessage } from '@langchain/core/messages'
import { StateGraphArgs } from '@langchain/langgraph/web'
import { ChatOpenAI } from '@langchain/openai'
import { NgmCopilotService } from '@metad/copilot-angular'
import { SemanticModelService } from '../../model.service'
import { createCommandAgent } from '../langgraph-helper-utilities'
import { SYSTEM_PROMPT } from './cube.command'
import { injectCreateCubeTool } from './tools'

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

  const dimensions = modelService.dimensions

  const systemContext = async () => {
    const sharedDimensionsPrompt = JSON.stringify(
      dimensions()
        .filter((dimension) => dimension.hierarchies?.length)
        .map((dimension) => ({
          name: dimension.name,
          caption: dimension.caption,
          table: dimension.hierarchies[0].tables[0]?.name,
          primaryKey: dimension.hierarchies[0].primaryKey
        }))
    )
    return `${copilotService.rolePrompt()}
There is no need to create as dimension with those table fields that are already used in dimensionUsages.
The cube can fill the source field in dimensionUsages only within the name of shared dimensions:
\`\`\`
${sharedDimensionsPrompt}
\`\`\`
`
  }

  return async (llm: ChatOpenAI) => {
    // const superGraph = new StateGraph({ channels: cubeState })
    //   // Add steps nodes
    //   .addNode(PLANNER_NAME, runPlanner)

    const agent = await createCommandAgent(llm, [createCubeTool], SYSTEM_PROMPT, systemContext)
    return agent
  }
}
