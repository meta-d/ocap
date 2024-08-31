import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { filter, map, Observable } from 'rxjs'
import { CopilotCheckpointSaver } from '../../../copilot-checkpoint/'
import { CopilotService } from '../../../copilot/'
import { ChatConversationAgent } from '../../chat-conversation'
import { ChatAgentState } from '../../types'
import { ChatCommand } from '../chat.command'
import { shortuuid } from '@metad/server-common'

@CommandHandler(ChatCommand)
export class ChatCommandHandler implements ICommandHandler<ChatCommand> {
	private readonly conversations = new Map<string, ChatConversationAgent>()

	constructor(
		private readonly copilotService: CopilotService,
		private readonly copilotCheckpointSaver: CopilotCheckpointSaver,
		private readonly commandBus: CommandBus
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
				new ChatConversationAgent(conversationId, user, copilot, this.copilotCheckpointSaver, this.commandBus)
			)
		}
		const conversation = this.conversations.get(conversationId)

		if (language) {
			conversation.updateState({
				language: `Please answer in language: ${language}`
			})
		}

		const answerId = shortuuid()
		return conversation.chat(content).pipe(
			filter((content) => content != null),
			map((content: string) => {
				// const lastMessage = state.messages[state.messages.length - 1]
				return {
					conversationId,
					id: answerId,
					content // lastMessage.content
				}
			}),
		)
	}
}
