import { IBasePerTenantAndOrganizationEntityModel } from './base-entity.model'
import { ICopilotRole } from './copilot-role.model'

export interface IChatConversation extends IBasePerTenantAndOrganizationEntityModel {
  key: string
  title?: string

  roleId?: string | null
  role?: ICopilotRole
  
  options?: {
    messages: any[]
  }
}

export type ChatMessage = {
  conversationId: string;
  id: string;
  content: string
}

export type ChatUserMessage = ChatMessage & {
  language: string
}