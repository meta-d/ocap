import { AiProviderRole } from '@metad/contracts'
import { Agent, DataSourceFactory } from '@metad/ocap-core'
import { CopilotCheckpointSaver, CopilotKnowledgeService, CopilotService } from '@metad/server-ai'
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { CommandBus } from '@nestjs/cqrs'
import { IsNull } from 'typeorm'
import { ChatBIModelService } from '../chatbi-model/chatbi-model.service'
import { SemanticModelMemberService } from '../model-member/member.service'
import { NgmDSCoreService, OCAP_AGENT_TOKEN, OCAP_DATASOURCE_TOKEN } from '../model/ocap'
import { ChatBIConversation } from './conversation'
import { ChatBILarkContext, ChatBIUserSession, IChatBI } from './types'

@Injectable()
export class ChatBIService implements IChatBI {
	private readonly logger = new Logger(ChatBIService.name)

	readonly userConversations = new Map<string, ChatBIConversation>()

	readonly userSessions: Record<string, ChatBIUserSession> = {}

	constructor(
		private readonly copilotService: CopilotService,
		private readonly modelService: ChatBIModelService,
		private readonly semanticModelMemberService: SemanticModelMemberService,
		private readonly copilotCheckpointSaver: CopilotCheckpointSaver,
		private readonly copilotKnowledgeService: CopilotKnowledgeService,
		@Inject(CACHE_MANAGER)
		public readonly cacheManager: Cache,
		@Inject(OCAP_AGENT_TOKEN)
		private agent: Agent,
		@Inject(OCAP_DATASOURCE_TOKEN)
		private dataSourceFactory: { type: string; factory: DataSourceFactory },

		private readonly commandBus: CommandBus
	) {}

	async getUserConversation(input: ChatBILarkContext): Promise<ChatBIConversation> {
		const { chatId, userId, larkService } = input
		const conversationId = userId + '/' + chatId
		if (!this.userConversations.get(conversationId)) {
			this.logger.debug(`未找到会话，新建会话为用户：${userId}`)
			try {
				this.userConversations.set(conversationId, await this.createChatConversation(input))
			} catch (err) {
				console.error(err)
				larkService.errorMessage(input, err)
			}
		}

		return this.userConversations.get(conversationId)
	}

	async createChatConversation(input: ChatBILarkContext) {
		const { tenant, organizationId, chatId } = input
		const tenantId = tenant.id
		const { items } = await this.copilotService.findAllWithoutOrganization({
			where: {
				tenantId,
				organizationId: organizationId ? organizationId : IsNull()
			}
		})
		const copilot = items.find((item) => item.role === AiProviderRole.Primary)
		if (!copilot) {
			throw new Error(
				`No copilot configuration found for tenant: '${tenantId}' and organization: '${organizationId}'`
			)
		}

		return new ChatBIConversation(
			input,
			copilot,
			this.modelService,
			this.semanticModelMemberService,
			this.copilotCheckpointSaver,
			// New Ocap context for every chatbi conversation
			new NgmDSCoreService(this.agent, this.dataSourceFactory),
			this.copilotKnowledgeService,
			this
		)
	}

	async upsertUserSession(userId: string, value: Partial<ChatBIUserSession>) {
		const chatModel = await this.modelService.findOneByConditions({ tenantId: value.tenantId, organizationId: value.organizationId, id: value.chatModelId })
		const session = this.userSessions[userId]
		// if (session && session.chatModelId !== value.chatModelId) {
		// 	// Clear user's conversation context
		// 	for (const key of this.userConversations.keys()) {
		// 		if (key.startsWith(userId)) {
		// 			this.userConversations.get(userId).context = null
		// 		}
		// 	}
		// }
		this.userSessions[userId] = {
			...(session ?? {}),
			...value
		} as ChatBIUserSession
		return chatModel
	}
}
