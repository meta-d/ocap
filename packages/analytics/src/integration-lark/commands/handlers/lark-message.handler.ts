import { isString } from '@metad/copilot'
import { LarkMessage, LarkMessageCommand } from '@metad/server-core'
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { map, Observable } from 'rxjs'
import { ChatBICommand, ChatBILarkMessage } from '../../../chatbi/index'

@CommandHandler(LarkMessageCommand)
export class LarkMessageHandler implements ICommandHandler<LarkMessageCommand> {
	constructor(private readonly commandBus: CommandBus) {}

	public async execute(command: LarkMessageCommand): Promise<Observable<LarkMessage>> {
		const { input } = command
		const chatId = input.message.message.chat_id

		const result = await this.commandBus.execute(
			new ChatBICommand({
				tenant: input.tenant,
				userId: input.message.sender.sender_id.open_id,
				chatId,
				conversationId: chatId + '/' + input.message.sender.sender_id.open_id,
				text: JSON.parse(input.message.message.content).text,
				larkService: input.larkService
			})
		)

		return result.pipe(
			map((message: ChatBILarkMessage | string) => {
				const msg_type = isString(message) ? 'text' : message.type
				const content = isString(message) ? { text: message } : message.data
				return {
					params: {
						receive_id_type: 'chat_id'
					},
					data: {
						receive_id: chatId,
						content: JSON.stringify(content),
						msg_type
					}
				} as LarkMessage
			})
		)
	}
}
