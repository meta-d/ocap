import { LarkMessageCommand } from '@metad/server-core'
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ChatBICommand } from '../../../chatbi/index'

@CommandHandler(LarkMessageCommand)
export class LarkMessageHandler implements ICommandHandler<LarkMessageCommand> {
	constructor(private readonly commandBus: CommandBus) {}

	public async execute(command: LarkMessageCommand): Promise<unknown> {
		const { input } = command
		const chatId = input.message.message.chat_id
		const textContent = JSON.parse(input.message.message.content)
		let text = textContent.text as string
		// Remove mention user
		if (text && input.message.message.mentions) {
			input.message.message.mentions?.forEach((mention) => {
				text = text.split(mention.key).join('')
			})
		}
		return await this.commandBus.execute(
			new ChatBICommand({
				...input,
				userId: input.message.sender.sender_id.open_id,
				chatId,
				text
			})
		)
	}
}
