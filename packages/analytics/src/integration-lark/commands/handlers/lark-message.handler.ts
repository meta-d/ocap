import { LarkMessageCommand } from '@metad/server-core'
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ChatBICommand } from '../../../chatbi/index'

@CommandHandler(LarkMessageCommand)
export class LarkMessageHandler implements ICommandHandler<LarkMessageCommand> {
	constructor(private readonly commandBus: CommandBus) {}

	public async execute(command: LarkMessageCommand): Promise<unknown> {
		const { input } = command
		const chatId = input.message.message.chat_id

		return await this.commandBus.execute(
			new ChatBICommand({
				...input,
				userId: input.message.sender.sender_id.open_id,
				chatId,
				// conversationId: chatId + '/' + input.message.sender.sender_id.open_id,
				text: JSON.parse(input.message.message.content).text,
			})
		)
	}
}
