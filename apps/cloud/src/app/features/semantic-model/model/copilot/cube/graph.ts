import { inject } from '@angular/core'
import { SystemMessage } from '@langchain/core/messages'
import { CreateGraphOptions } from '@metad/copilot'
import { SemanticModelService } from '../../model.service'
import { markdownSharedDimensions } from '../dimension/types'
import { injectQueryTablesTool, injectSelectTablesTool } from '../tools'
import { SYSTEM_PROMPT } from './cube.command'
import { injectCreateCubeTool } from './tools'
import { StateGraphArgs } from '@langchain/langgraph/web'
import { createCopilotAgentState, createReactAgent } from 'apps/cloud/src/app/@core/copilot'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { AgentState } from '@metad/copilot-angular'

export const CUBE_MODELER_NAME = 'CubeModeler'

export function injectCubeModeler() {
  const modelService = inject(SemanticModelService)

  const createCubeTool = injectCreateCubeTool()
  const selectTablesTool = injectSelectTablesTool()
  const queryTablesTool = injectQueryTablesTool()

  const dimensions = modelService.dimensions
  const cubes = modelService.cubes

  const systemContext = async () => {
    const sharedDimensions = dimensions().filter((dimension) => dimension.hierarchies?.length)
    return (`{role}\n` +
      ` The cube name can't be the same as the fact table name.` +
      (cubes().length
        ? ` The cube name cannot be any of the following existing cubes [${cubes()
            .map(({ name }) => name)
            .join(', ')}]`
        : '') +
      ` There is no need to create as dimension with those table fields that are already used in 'dimensionUsages'.` +
      (sharedDimensions.length
        ? ` The cube can fill the source field in dimensionUsages only within the name of shared dimensions:
\`\`\`
${markdownSharedDimensions(sharedDimensions)}
\`\`\`
`
        : '')
    )
  }

  return async ({ llm, checkpointer }: CreateGraphOptions) => {
    const state: StateGraphArgs<AgentState>['channels'] = createCopilotAgentState()
    return createReactAgent({
      llm,
      checkpointSaver: checkpointer,
      state,
      tools: [selectTablesTool, queryTablesTool, createCubeTool],
      messageModifier: async (state) => {
        const system = await SystemMessagePromptTemplate.fromTemplate(
          SYSTEM_PROMPT + `\n\n${await systemContext()}\n\n` + `{context}`
        ).format(state as any)
        return [new SystemMessage(system), ...state.messages]
      }
    })
  }
}
