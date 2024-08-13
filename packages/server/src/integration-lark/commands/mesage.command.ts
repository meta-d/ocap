import { ICommand } from '@nestjs/cqrs'

export class LarkMessageCommand implements ICommand {
	static readonly type = '[Lark] Message'

	constructor(
		public readonly input: {
			message: {
				chat_id: string
				chat_type: string
				content: string
				create_time: string
				message_id: string
				message_type: 'text' | 'image'
				update_time: string
			}
		}
	) {}
}
