import { LarkMessageCommand } from '@metad/server-core'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

@CommandHandler(LarkMessageCommand)
export class ChatBIHandler implements ICommandHandler<LarkMessageCommand> {

	public async execute(command: LarkMessageCommand): Promise<any> {
		const { input } = command
		console.log(input)
		const chatId = input.message.chat_id
		
		return {
			receive_id: chatId,
			content: JSON.stringify({ text: 'hello world!!!!! @chatbi' }),
			msg_type: 'text'
		}
	}
}
