import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { from, Observable } from 'rxjs'
import { ChatBIService } from '../../chatbi.service'
import { ChatBICommand } from '../chatbi.command'

@CommandHandler(ChatBICommand)
export class ChatBIHandler implements ICommandHandler<ChatBICommand> {
	readonly commandName = 'chatbi'

	constructor(private readonly chatBIService: ChatBIService) {}

	public async execute(command: ChatBICommand): Promise<Observable<any>> {
		const { input } = command
		const { larkService } = input

		const conversation = await this.chatBIService.getUserConversation(input)
		if (!conversation) {
			return from(
				larkService.errorMessage(
					input,
					new Error(`Failed to create chat conversation for user: ${input.userId}`)
				)
			)
		}

		return new Observable((subscriber) => {
			conversation.ask(input.text).then()
			return () => {
				// when cancel
				conversation.destroy()
			}
		})
	}
}
