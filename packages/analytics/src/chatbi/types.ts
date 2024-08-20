import { CompiledStateGraph, StateGraphArgs } from '@langchain/langgraph'
import { IChatBIModel } from '@metad/contracts'
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
  larkService: LarkService
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
  models: IChatBIModel[]

  upsertIndicator(indicator: Indicator): void
  newThread(): void
  destroy(): void
  answerMessage(data: any): Promise<any>
  getCubeCache(modelId: string, cubeName: string): Promise<EntityType>
  setCubeCache(modelId: string, cubeName: string, data: any): Promise<void>
  messageWithEndAction(data: any, action?: (action: any) => void): void

  ask(content: string): Promise<void>
}

export const C_CHATBI_END_CONVERSATION = 'chatbi-end-conversation'