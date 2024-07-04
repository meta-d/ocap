import { BaseMessage } from '@langchain/core/messages'

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
