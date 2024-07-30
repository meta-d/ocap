import { StateGraphArgs } from '@langchain/langgraph/web'
import { AgentState, createCopilotAgentState } from '@metad/copilot'

export type InsightAgentState = AgentState
export const insightAgentState: StateGraphArgs<InsightAgentState>['channels'] = {
  ...createCopilotAgentState()
}
