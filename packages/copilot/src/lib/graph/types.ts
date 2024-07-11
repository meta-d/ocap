import { BaseMessage } from '@langchain/core/messages'

export interface AgentState {
  input: string
  role: string
  context: string
  messages: BaseMessage[]
}

export function createCopilotAgentState() {
  return {
    input: {
      value: (x: any, y: any) => y ?? x,
      default: () => ''
    },
    role: {
      value: (x: any, y: any) => y ?? x,
      default: () => ''
    },
    context: {
      value: (x: any, y: any) => y ?? x,
      default: () => ''
    },
    messages: {
      value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
      default: () => []
    }
  }
}
