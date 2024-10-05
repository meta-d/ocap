import { StateGraphArgs } from '@langchain/langgraph'
import { AgentState, createCopilotAgentState } from '../copilot'

export type ChatAgentState = AgentState
export const chatAgentState: StateGraphArgs<ChatAgentState>['channels'] = {
	...createCopilotAgentState()
}
