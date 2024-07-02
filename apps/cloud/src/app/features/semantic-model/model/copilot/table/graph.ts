import { inject } from '@angular/core'
import { SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { StateGraphArgs } from '@langchain/langgraph/web'
import { CreateGraphOptions } from '@metad/copilot'
import { AgentState } from '@metad/copilot-angular'
import { createCopilotAgentState, createReactAgent } from '../../../../../@core/copilot'
import { SemanticModelService } from '../../model.service'
import { injectCreateTableTool } from './tools'

export const TABLE_CREATOR_NAME = 'TableCreator'

function createSystemPrompt(dialect: string) {
  return (
    `You are a cube modeling expert. Let's create or edit the pyhsical table!` +
    `\n{role}` +
    `\nThe database dialect is '${dialect}'.` +
    `\n\n` +
    `{context}`
  )
}

export function injectTableCreator() {
  const createTableTool = injectCreateTableTool()
  const modelService = inject(SemanticModelService)

  const dialect = modelService.dialect

  return async ({ llm, checkpointer }: CreateGraphOptions) => {
    const state: StateGraphArgs<AgentState>['channels'] = createCopilotAgentState()
    return createReactAgent({
      llm,
      checkpointSaver: checkpointer,
      state,
      tools: [createTableTool],
      messageModifier: async (state) => {
        const system = await SystemMessagePromptTemplate.fromTemplate(createSystemPrompt(dialect())).format(state)
        return [new SystemMessage(system), ...state.messages]
      }
    })
  }
}