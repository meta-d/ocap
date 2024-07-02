import { BaseMessage } from '@langchain/core/messages'
import { RunnableLambda } from '@langchain/core/runnables'
import { AgentState } from '@metad/copilot-angular'
import { Team } from 'apps/cloud/src/app/@core/copilot'

export const PLANNER_NAME = 'Planner'
export const SUPERVISOR_NAME = 'Supervisor'

// Define the top-level State interface
export interface State extends Team.State {
  plan: string[]
}

export interface IPlanState extends AgentState {
  objective: string
}

export const getMessages = RunnableLambda.from((state: AgentState) => {
  return { messages: state.messages }
})

export const joinGraph = RunnableLambda.from((response: any) => {
  return {
    messages: [response.messages[response.messages.length - 1]]
  }
})
