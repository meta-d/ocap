import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { AIMessage } from '@langchain/core/messages'
import { ChatOllama } from '@langchain/ollama'
import { ChatOpenAI, ClientOptions } from '@langchain/openai'
import { AiProviderRole, ICopilot } from '@metad/contracts'
import { AiProvider } from '@metad/copilot'
import { CopilotCheckpointSaver, CopilotService } from '@metad/server-core'
import { Injectable, Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { SemanticModelService } from '../model'
import { SemanticModelMemberService } from '../model-member/member.service'
import { NgmDSCoreService } from '../model/ocap'
import { ChatBIConversation } from './conversation'
import { ChatBILarkContext, ChatBIUserSession, IChatBI } from './types'

export function createLLM<T = ChatOpenAI | BaseChatModel>(
	copilot: ICopilot,
	clientOptions: ClientOptions,
	tokenRecord: (input: { copilot: ICopilot; tokenUsed: number }) => void
): T {
	switch (copilot?.provider) {
		case AiProvider.OpenAI:
		case AiProvider.Azure:
			return new ChatOpenAI({
				apiKey: copilot.apiKey,
				configuration: {
					baseURL: copilot.apiHost || null,
					...(clientOptions ?? {})
				},
				model: copilot.defaultModel,
				temperature: 0,
				callbacks: [
					{
						handleLLMEnd(output) {
							// console.log(output.llmOutput?.totalTokens)
							// let tokenUsed = 0
							// output.generations?.forEach((generation) => {
							// 	generation.forEach((item) => {
							// 		tokenUsed += (<AIMessage>(item as any).message).usage_metadata?.total_tokens ?? 0
							// 	})
							// })
							tokenRecord({ copilot, tokenUsed: output.llmOutput?.totalTokens ?? 0 })
						}
					}
				]
			}) as T
		case AiProvider.Ollama:
			return new ChatOllama({
				baseUrl: copilot.apiHost || null,
				model: copilot.defaultModel,
				callbacks: [
					{
						handleLLMEnd(output) {
							let tokenUsed = 0
							output.generations?.forEach((generation) => {
								generation.forEach((item) => {
									tokenUsed += (<AIMessage>(item as any).message).usage_metadata.total_tokens
								})
							})
							tokenRecord({ copilot, tokenUsed })
						}
					}
				]
			}) as T
		default:
			return null
	}
}

@Injectable()
export class ChatBIService implements IChatBI {
	private readonly logger = new Logger(ChatBIService.name)

	readonly userConversations = new Map<string, ChatBIConversation>()

	readonly userSessions: Record<string, ChatBIUserSession> = {}

	constructor(
		private readonly copilotService: CopilotService,
		private readonly modelService: SemanticModelService,
		private readonly semanticModelMemberService: SemanticModelMemberService,
		private readonly copilotCheckpointSaver: CopilotCheckpointSaver,
		private readonly dsCoreService: NgmDSCoreService,
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
		const { tenant, userId, chatId } = input
		const tenantId = tenant.id
		const { items } = await this.copilotService.findAllWithoutOrganization({ where: { tenantId } })
		const copilot = items.find((item) => item.role === AiProviderRole.Primary)
		const llm = createLLM<BaseChatModel>(copilot as any, {}, (input) => {
			//
		})

		const { items: models } = await this.modelService.findAll({
			where: { tenantId, organizationId: input.organizationId }
		})

		return new ChatBIConversation(
			input,
			models,
			llm,
			this.semanticModelMemberService,
			this.copilotCheckpointSaver,
			this.dsCoreService
		)
	}

	upsertUserSession(userId: string, value: Partial<ChatBIUserSession>) {
		const session = this.userSessions[userId]
		if (session && (session.cubeName !== value.cubeName || session.modelId !== value.modelId)) {
			// Clear user's conversation context
			for (const key of this.userConversations.keys()) {
				if (key.startsWith(userId)) {
					this.userConversations.get(userId).context = null
				}
			}
		}
		this.userSessions[userId] = {
			...(session ?? {}),
			...value
		} as ChatBIUserSession
	}
}
