import { shortuuid } from '@metad/server-common'
import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs'
import { formatDocumentsAsString } from 'langchain/util/document'
import { filter, map, Observable } from 'rxjs'
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
		const { tenantId, organizationId, user, message } = command.input
		const { conversationId, id, language, content } = message
		if (!this.conversations.has(conversationId)) {
			const copilot = await this.copilotService.findCopilot(tenantId, organizationId)
			if (!copilot) {
				throw new Error('copilot not found')
			}
			this.conversations.set(
				conversationId,
				new ChatConversationAgent(
					conversationId,
					organizationId,
					user,
					copilot,
					this.copilotCheckpointSaver,
					this.commandBus,
					this.queryBus
				)
			)
		}
		const conversation = this.conversations.get(conversationId)

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
			score: 0.5
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
					conversation.updateMessage({ id: answerId, content, role: 'assistant' })
				}
				return null
			}),
			filter((data) => data != null)
		)
	}
}
