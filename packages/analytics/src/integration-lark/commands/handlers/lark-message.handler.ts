import { LarkMessage, LarkMessageCommand } from '@metad/server-core'
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { map, Observable, tap } from 'rxjs'
import { ChatBICommand } from '../../../chatbi/index'

@CommandHandler(LarkMessageCommand)
export class LarkMessageHandler implements ICommandHandler<LarkMessageCommand> {
	constructor(private readonly commandBus: CommandBus) {}

	public async execute(command: LarkMessageCommand): Promise<Observable<LarkMessage>> {
		const { input } = command
		const chatId = input.message.chat_id

		const result = await this.commandBus.execute(
			new ChatBICommand({
				tenantId: input.tenant.id,
				conversationId: chatId,
				text: input.message.content
			})
		)

		return result.pipe(
			map((content: string) => ({
				params: {
					receive_id_type: 'chat_id'
				},
				data: {
					receive_id: chatId,
					content: JSON.stringify({ text: content }),
					msg_type: 'text'
				}
			} as LarkMessage))
		)
	}
}
