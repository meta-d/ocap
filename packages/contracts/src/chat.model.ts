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
  StepStart = 'step_start',
  StepEnd = 'step_end',
  ToolStart = 'tool_start',
  ToolEnd = 'tool_end',
  ChainStart = 'chain_start',
  ChainEnd = 'chain_end',
  CancelChain = 'cancel_chain',
  ChainAborted = 'chain_aborted',
}

export type ChatGatewayMessage = {
  organizationId?: string;
  role?: {
    id: string
		knowledgebases?: string[]
    toolsets: string[] | null
  }
} & ({
  event: ChatGatewayEvent.CancelChain
  data: {
    conversationId: string // Conversation ID
  }
} | {
  event: ChatGatewayEvent.ChainAborted
  data: {
    conversationId: string // Conversation ID
    id?: string // Message id
  }
} | {
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
} | {
  event: ChatGatewayEvent.StepStart | ChatGatewayEvent.StepEnd
  data: CopilotChatMessage
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
   * - aborted: AI is aborted
   * - error: AI has error
   */
  status?: 'thinking' | 'answering' | 'pending' | 'done' | 'aborted' | 'error'

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

export interface CopilotMessageGroup extends CopilotBaseMessage {
  messages: CopilotChatMessage[]
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

// Type guards
export function isMessageGroup(message: CopilotBaseMessage): message is CopilotMessageGroup {
  return 'messages' in message;
}