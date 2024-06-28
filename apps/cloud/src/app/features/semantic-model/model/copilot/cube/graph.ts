import { inject } from '@angular/core'
import { SystemMessage } from '@langchain/core/messages'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { CreateGraphOptions } from '@metad/copilot'
import { NgmCopilotService } from '@metad/copilot-angular'
import { SemanticModelService } from '../../model.service'
import { markdownSharedDimensions } from '../dimension/types'
import { injectQueryTablesTool, injectSelectTablesTool } from '../tools'
import { SYSTEM_PROMPT } from './cube.command'
import { injectCreateCubeTool } from './tools'

export const CUBE_MODELER_NAME = 'CubeModeler'

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
    return (
      copilotService.rolePrompt() +
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
    return createReactAgent({
      llm,
      checkpointSaver: checkpointer,
      tools: [selectTablesTool, queryTablesTool, createCubeTool],
      messageModifier: async (messages) => {
        return [new SystemMessage(SYSTEM_PROMPT + `\n\n${await systemContext()}\n\n` + `{context}`), ...messages]
      }
    })
  }
}
