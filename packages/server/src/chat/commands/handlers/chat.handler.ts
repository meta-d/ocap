import { IChatConversation, TOOLSETS } from '@metad/contracts'
import { shortuuid } from '@metad/server-common'
import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs'
import { formatDocumentsAsString } from 'langchain/util/document'
import { isNil } from 'lodash'
import { filter, map, Observable } from 'rxjs'
import { ChatConversationCreateCommand, FindChatConversationQuery } from '../../../chat-conversation'
import { CopilotCheckpointSaver } from '../../../copilot-checkpoint/'
import { CopilotService } from '../../../copilot/'
import { KnowledgebaseService } from '../../../knowledgebase'
import { ChatConversationAgent } from '../../chat-conversation'
import { ChatCommand } from '../chat.command'

@CommandHandler(ChatCommand)
export class ChatCommandHandler implements ICommandHandler<ChatCommand> {
	private readonly conversations = new Map<string, ChatConversationAgent>()

	constructor(
		private readonly copilotService: CopilotService,
		private readonly copilotCheckpointSaver: CopilotCheckpointSaver,
		private readonly knowledgebaseService: KnowledgebaseService,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	public async execute(command: ChatCommand): Promise<Observable<any>> {
		const { tenantId, organizationId, user, role, message } = command.input
		const { conversationId, id, language, content } = message
		let chatConversation: IChatConversation = null
		if (isNil(conversationId)) {
			chatConversation = await this.commandBus.execute(
				new ChatConversationCreateCommand({
					entity: {
						tenantId,
						organizationId,
						roleId: role?.id,
						options: {
							knowledgebases: role?.knowledgebases
						}
					}
				})
			)
		} else {
			chatConversation = await this.queryBus.execute(
				new FindChatConversationQuery({
					id: conversationId
				})
			)
		}
		if (!this.conversations.has(chatConversation.id)) {
			const copilot = await this.copilotService.findCopilot(tenantId, organizationId)
			if (!copilot) {
				throw new Error('copilot not found')
			}

			this.conversations.set(
				chatConversation.id,
				new ChatConversationAgent(
					chatConversation,
					organizationId,
					user,
					copilot,
					this.copilotCheckpointSaver,
					this.commandBus,
					this.queryBus
				).createAgentGraph(TOOLSETS.filter((item) => role?.toolsets?.includes(item.id)))
			)
		}
		const conversation = this.conversations.get(chatConversation.id)

		if (language) {
			conversation.updateState({
				language: `Please answer in language: ${language}`
			})
		}

		const answerId = shortuuid()
		const documents = await this.knowledgebaseService.similaritySearch(content, {
			tenantId,
			organizationId,
			k: 5,
			score: 0.5,
			knowledgebases: chatConversation.options?.knowledgebases
		})
		const context = formatDocumentsAsString(documents)

		conversation.updateState({
			context
		})

		// Update conversation messages
		await conversation.updateMessage({ id, content, role: 'user' })
		return conversation.chat(content).pipe(
			filter((data) => data != null),
			map(({ event, content }) => {
				if (event === 'on_chat_model_stream') {
					return {
						conversationId,
						id: answerId,
						content // lastMessage.content
					}
				} else if (event === 'on_chat_model_end') {
					if (content) {
						conversation.updateMessage({ id: answerId, content, role: 'assistant' })
					}
				}
				return null
			}),
			filter((data) => data != null)
		)
	}
}
