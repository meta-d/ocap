import { BaseMessage } from '@langchain/core/messages'

export interface ConversationState {
  role: string
  context: string
  messages: BaseMessage[]
}
