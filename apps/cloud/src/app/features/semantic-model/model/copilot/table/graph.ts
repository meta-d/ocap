import { inject } from '@angular/core'
import { SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { StateGraphArgs } from '@langchain/langgraph/web'
import { createCopilotAgentState, CreateGraphOptions, createReactAgent } from '@metad/copilot'
import { AgentState } from '@metad/copilot-angular'
import { SemanticModelService } from '../../model.service'
import { injectCreateTableTool } from './tools'

export const TABLE_CREATOR_NAME = 'TableCreator'

function createSystemPrompt(dialect: string) {
  return (
    `You are a cube modeling expert. Let's create or edit the pyhsical table!
{role}
{language}
The database dialect is '${dialect}'.
Consider the tables that need to be created based on the user's questions and call the 'createTable' tool to create them one by one.
You need to add short labels to the created table and its columns.
In PostgreSQL, the 'LABEL' syntax is incorrect, we can add labels by using Comment.
{context}`
  )
}

export function injectTableCreator() {
  const createTableTool = injectCreateTableTool()
  const modelService = inject(SemanticModelService)

  const dialect = modelService.dialect

  return async ({ llm, checkpointer, interruptBefore, interruptAfter }: CreateGraphOptions) => {
    const state: StateGraphArgs<AgentState>['channels'] = createCopilotAgentState()
    return createReactAgent({
      llm,
      checkpointSaver: checkpointer,
      state,
      interruptBefore,
      interruptAfter,
      tools: [ createTableTool ],
      messageModifier: async (state) => {
        const system = await SystemMessagePromptTemplate.fromTemplate(createSystemPrompt(dialect())).format(state)
        return [new SystemMessage(system), ...state.messages]
      }
    })
  }
}
