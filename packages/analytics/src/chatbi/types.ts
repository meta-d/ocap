import { StateGraphArgs } from '@langchain/langgraph'
import { AgentState, createCopilotAgentState } from '@metad/copilot'
import { DSCoreService, EntityType } from '@metad/ocap-core'
import { ChatLarkContext, LarkService } from '@metad/server-core'
import { Logger } from '@nestjs/common'

export const CHATBI_COMMAND_NAME = 'chatbi'
export type ChatBIAgentState = AgentState
export const insightAgentState: StateGraphArgs<ChatBIAgentState>['channels'] = {
  ...createCopilotAgentState()
}

export type ChatBIUserSession = {
  tenantId: string
  organizationId: string
  modelId: string
  cubeName: string
}

export type ChatContext = {
  chatId: string
  logger: Logger,
  dsCoreService?: DSCoreService
  entityType?: EntityType
  larkService?: LarkService
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