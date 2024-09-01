import { IBasePerTenantAndOrganizationEntityModel } from './base-entity.model'
import { ICopilotRole } from './copilot-role.model'

export interface IChatConversation extends IBasePerTenantAndOrganizationEntityModel {
  key: string
  title?: string

  roleId?: string | null
  role?: ICopilotRole
  
  options?: {
    //
  }

  messages?: CopilotChatMessage[] | null
}

export type ChatMessage = {
  conversationId: string;
  id: string;
  content: string
}

export type ChatUserMessage = ChatMessage & {
  language: string
}

export type CopilotChatMessage = {
  id: string
  tool_call_id?: string
  createdAt?: Date
  content: string | any
  /**
   * If the message has a role of `function`, the `name` field is the name of the function.
   * Otherwise, the name field should not be set.
   */
  name?: string

  data?: JSONValue

  error?: string

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