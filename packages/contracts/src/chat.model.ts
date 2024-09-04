import { IBasePerTenantAndOrganizationEntityModel } from './base-entity.model'
import { ICopilotRole } from './copilot-role.model'

export interface IChatConversation extends IBasePerTenantAndOrganizationEntityModel {
  key: string
  title?: string

  roleId?: string | null
  role?: ICopilotRole
  
  options?: {
    knowledgebases: string[]
    toolsets: string[]
  }

  messages?: CopilotBaseMessage[] | null
}

// Types
export type ChatMessage = {
  conversationId: string;
  id: string;
  content: string
}

export type ChatUserMessage = ChatMessage & {
  language: string
}

export enum ChatGatewayEvent {
  ConversationCreated = 'conversation_created',
  MessageStream = 'message_stream',
  ToolStart = 'tool_start',
  ToolEnd = 'tool_end',
  ChainStart = 'chain_start',
  ChainEnd = 'chain_end',
}

export type ChatGatewayMessage = {
  organizationId?: string;
  role?: {
    id: string
		knowledgebases?: string[]
    toolsets: string[] | null
  }
} & ({
  event: ChatGatewayEvent.ConversationCreated
  data: IChatConversation
} | {
  event: ChatGatewayEvent.MessageStream
  data: ChatUserMessage
} | {
  event: ChatGatewayEvent.ToolStart | ChatGatewayEvent.ToolEnd
  data: {
    id: string
    name: string
    output?: string
  }
} | {
  event: ChatGatewayEvent.ChainStart | ChatGatewayEvent.ChainEnd
  data: {
    id: string
  }
})

export interface CopilotBaseMessage {
  id: string
  createdAt?: Date
  role: 'system' | 'user' | 'assistant' | 'function' | 'data' | 'tool' | 'info'
  
  /**
   * Status of the message:
   * - thinking: AI is thinking
   * - answering: AI is answering
   * - pending: AI is pending for confirm or more information
   * - done: AI is done
   * - error: AI has error
   * - info: todo
   */
  status?: 'thinking' | 'answering' | 'pending' | 'done' | 'error' | 'info'

  content?: string | any
}

export type CopilotChatMessage = CopilotBaseMessage & {
  tool_call_id?: string
  
  /**
   * If the message has a role of `function`, the `name` field is the name of the function.
   * Otherwise, the name field should not be set.
   */
  name?: string

  data?: JSONValue

  error?: string
}

export type JSONValue =
  | null
  | string
  | number
  | boolean
  | {
      [x: string]: JSONValue
    }
  | Array<JSONValue>
