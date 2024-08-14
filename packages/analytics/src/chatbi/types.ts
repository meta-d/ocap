import { CompiledStateGraph, StateGraphArgs } from '@langchain/langgraph'
import { AgentState, createCopilotAgentState } from '@metad/copilot'
import { DSCoreService, EntityType } from '@metad/ocap-core'
import { ChatLarkContext, LarkService } from '@metad/server-core'
import { Logger } from '@nestjs/common'
import { Subject } from 'rxjs'

export const CHATBI_COMMAND_NAME = 'chatbi'
export type ChatBIAgentState = AgentState
export const insightAgentState: StateGraphArgs<ChatBIAgentState>['channels'] = {
  ...createCopilotAgentState()
}

export interface IChatBI {
  endConversation(id: string): void
}

export type ChatBIUserSession = {
  tenantId: string
  organizationId: string
  modelId: string
  cubeName: string
}

export type ChatContext = {
  conversationId?: string
  chatId: string
  logger: Logger,
  dsCoreService?: DSCoreService
  entityType?: EntityType
  larkService?: LarkService
  chatBIService?: IChatBI
}

export type ChatBILarkMessage = {
  type: 'text' | 'interactive',
  data: any
}

export type ChatBILarkContext = ChatLarkContext & {
  chatId: string
  userId: string
  conversationId: string
  text: string
}

export type ChatBIConversation = {
  chatId: string
  graph: CompiledStateGraph<ChatBIAgentState, Partial<ChatBIAgentState>, '__start__' | 'agent' | 'tools'>
  destroy: Subject<void>
}