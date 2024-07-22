import { inject } from '@angular/core'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { RunnableLambda } from '@langchain/core/runnables'
import { StateGraphArgs } from '@langchain/langgraph/web'
import { createCopilotAgentState, CreateGraphOptions, createReactAgent, Team } from '@metad/copilot'
import { AgentState } from '@metad/copilot-angular'
import {
  injectAgentFewShotTemplate
} from 'apps/cloud/src/app/@core/copilot'
import { SemanticModelService } from '../../model.service'
import { markdownSharedDimensions } from '../dimension/types'
import { injectQueryTablesTool, injectSelectTablesTool } from '../tools'
import { SYSTEM_PROMPT } from './cube.command'
import { injectCreateCubeTool } from './tools'
import { CubeCommandName } from './types'

export function injectCubeModeler() {
  const modelService = inject(SemanticModelService)

  const createCubeTool = injectCreateCubeTool()
  const selectTablesTool = injectSelectTablesTool()
  const queryTablesTool = injectQueryTablesTool()

  const dimensions = modelService.dimensions
  const cubes = modelService.cubes

  const systemContext = async () => {
    const sharedDimensions = dimensions().filter((dimension) => dimension.hierarchies?.length)
    return (
`{role}
{language}
The cube name can't be the same as the fact table name.` +
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

  return async ({ llm, checkpointer, interruptBefore, interruptAfter }: CreateGraphOptions) => {
    const state: StateGraphArgs<AgentState>['channels'] = createCopilotAgentState()
    return createReactAgent({
      llm,
      checkpointSaver: checkpointer,
      state,
      interruptBefore,
      interruptAfter,
      tools: [selectTablesTool, queryTablesTool, createCubeTool],
      messageModifier: async (state) => {
        const system = await SystemMessagePromptTemplate.fromTemplate(
          SYSTEM_PROMPT + `\n\n${await systemContext()}\n\n` + `{context}`
        ).format(state)
        return [new SystemMessage(system), ...state.messages]
      }
    })
  }
}

export function injectRunCubeModeler() {
  const createCubeModeler = injectCubeModeler()
  const fewShotPrompt = injectAgentFewShotTemplate(CubeCommandName, { k: 1, vectorStore: null })

  return async ({ llm, checkpointer, interruptBefore, interruptAfter }: CreateGraphOptions) => {
    const agent = await createCubeModeler({ llm, checkpointer, interruptBefore, interruptAfter })

    return RunnableLambda.from(async (state: AgentState) => {
      const content = await fewShotPrompt.format({ input: state.input, context: '' })
      return {
        input: state.input,
        messages: [new HumanMessage(content)],
        role: state.role,
        context: state.context,
        language: state.language
      }
    })
      .pipe(agent)
      .pipe(Team.joinGraph)
  }
}
