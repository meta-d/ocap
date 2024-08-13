import { StateGraphArgs } from '@langchain/langgraph'
import { AgentState, createCopilotAgentState } from '@metad/copilot'

export const CHATBI_COMMAND_NAME = 'chatbi'
export type ChatBIAgentState = AgentState
export const insightAgentState: StateGraphArgs<ChatBIAgentState>['channels'] = {
  ...createCopilotAgentState()
}
