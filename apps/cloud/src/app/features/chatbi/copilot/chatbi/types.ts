import { StateGraphArgs } from '@langchain/langgraph/web'
import { AgentState, createCopilotAgentState } from '@metad/copilot'

export const CHATBI_COMMAND_NAME = 'chatbi'
export type InsightAgentState = AgentState
export const insightAgentState: StateGraphArgs<InsightAgentState>['channels'] = {
  ...createCopilotAgentState()
}
