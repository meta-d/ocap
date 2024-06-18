import { BaseMessage } from '@langchain/core/messages'
import { RunnableLambda } from '@langchain/core/runnables'

export const PLANNER_NAME = 'Planner'
export const SUPERVISOR_NAME = 'Supervisor'

export type IGraphState = {
  messages: BaseMessage[]
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
