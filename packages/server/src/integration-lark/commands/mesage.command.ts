import { ICommand } from '@nestjs/cqrs'
import { ChatLarkContext } from '../types'

export class LarkMessageCommand implements ICommand {
	static readonly type = '[Lark] Message'

	constructor(
		public readonly input: ChatLarkContext<{
			schema: '2.0'
			event_id: string
			token: string
			create_time: string
			event_type: 'im.message.receive_v1'
			tenant_key: string
			app_id: string
			message: {
				chat_id: string
				chat_type: string
				content: string
				create_time: string
				message_id: string
				message_type: 'text' | 'image'
				update_time: string
				mentions?: {
					id: {
						open_id: string
						union_id: string
						user_id: string
					}
					key: string
					name: string
					tenant_key: string
				}[]
			}
			sender: {
				sender_id: {
					open_id: string
					union_id: string
					user_id: string
				}
				sender_type: 'user'
				tenant_key: string
			}
		}>
	) {}
}
