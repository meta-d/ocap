import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs'
import { ChatService } from '../../chat.service'
import { CancelChatCommand } from '../cancel-chat.command'

@CommandHandler(CancelChatCommand)
export class CancelChatHandler implements ICommandHandler<CancelChatCommand> {
	constructor(
		private readonly chatService: ChatService,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	public async execute(command: CancelChatCommand): Promise<void> {
		const { tenantId, organizationId, user, event, data } = command.input
		const { conversationId, id } = data

		const conversation = this.chatService.getConversation(conversationId)
		conversation?.cancel()
	}
}
