import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ChatConversation } from '../../conversation.entity'
import { ChatConversationService } from '../../conversation.service'
import { ChatConversationUpdateCommand } from '../conversation-update.command'

@CommandHandler(ChatConversationUpdateCommand)
export class ChatConversationUpdateHandler implements ICommandHandler<ChatConversationUpdateCommand> {
	constructor(
		private readonly chatConversationService: ChatConversationService,
		private readonly commandBus: CommandBus
	) {}

	public async execute(command: ChatConversationUpdateCommand): Promise<any> {
		const { id, entity } = command.input
		await this.chatConversationService.update(id, entity as ChatConversation)
		return await this.chatConversationService.findOne(id)
	}
}
