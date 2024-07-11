import { SystemMessage } from '@langchain/core/messages'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { StateGraphArgs } from '@langchain/langgraph/web'
import { AgentState, CreateGraphOptions, createReactAgent, Team } from '@metad/copilot'
import { z } from 'zod'

const superState: StateGraphArgs<AgentState>['channels'] = Team.createState()

const dummyTool = new DynamicStructuredTool({
  name: 'dummy',
  description: `This dummy tool do't use`,
  schema: z.object({}),
  func: async () => {
    return ``
  }
})

export function injectCreateChatAgent() {
  return async ({ llm, checkpointer, interruptBefore, interruptAfter }: CreateGraphOptions) => {
    return createReactAgent({
      state: superState,
      llm,
      tools: [dummyTool],
      checkpointSaver: checkpointer,
      interruptBefore,
      interruptAfter,
      messageModifier: async (state) => {
        return [new SystemMessage(`${state.role}\n${state.context}`), ...state.messages]
      }
    })
  }
}
