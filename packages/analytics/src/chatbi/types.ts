import { CompiledStateGraph, StateGraphArgs } from '@langchain/langgraph'
import { AgentState, createCopilotAgentState } from '@metad/copilot'
import { DSCoreService, EntityType, Indicator } from '@metad/ocap-core'
import { ChatLarkContext, LarkService } from '@metad/server-core'
import { Logger } from '@nestjs/common'

export const CHATBI_COMMAND_NAME = 'chatbi'
export type ChatBIAgentState = AgentState
export const insightAgentState: StateGraphArgs<ChatBIAgentState>['channels'] = {
  ...createCopilotAgentState()
}

export interface IChatBI {
  // endConversation(id: string): void
  getUserConversation(input: ChatBILarkContext): Promise<any>;
}

export type ChatBIUserSession = {
  tenantId: string
  organizationId: string
  modelId: string
  cubeName: string
}

export type ChatContext = {
  conversationId?: string
  chatId?: string
  logger: Logger,
  dsCoreService?: DSCoreService
  entityType?: EntityType
  larkService?: LarkService
  chatBIService?: IChatBI
  conversation?: IChatBIConversation
}

export type ChatBILarkMessage = {
  type: 'text' | 'interactive',
  data: any
}

export type ChatBILarkContext = ChatLarkContext & {
  // chatId: string
  userId: string
  // conversationId: string
  text: string
}

export type IChatBIConversation = {
  id: string
  graph: CompiledStateGraph<ChatBIAgentState, Partial<ChatBIAgentState>, '__start__' | 'agent' | 'tools'>
  upsertIndicator(indicator: Indicator): void
  newThread(): void
  destroy(): void
}