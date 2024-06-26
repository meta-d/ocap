import { BaseMessage } from '@langchain/core/messages'
import { RunnableLambda } from '@langchain/core/runnables'
import { Team } from 'apps/cloud/src/app/@core/copilot'

export const PLANNER_NAME = 'Planner'
export const SUPERVISOR_NAME = 'Supervisor'

export type IGraphState = {
  messages: BaseMessage[]
}

// Define the top-level State interface
export interface State extends Team.State {
  plan: string[]
}

export interface IPlanState extends IGraphState {
  objective: string
}

export const getMessages = RunnableLambda.from((state: IGraphState) => {
  return { messages: state.messages }
})

export const joinGraph = RunnableLambda.from((response: any) => {
  return {
    messages: [response.messages[response.messages.length - 1]]
  }
})
