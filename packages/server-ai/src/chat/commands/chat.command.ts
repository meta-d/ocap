import { ChatGatewayMessage, IUser } from '@metad/contracts'
import { ICommand } from '@nestjs/cqrs'

export class ChatCommand implements ICommand {
	static readonly type = '[Chat] Message'

	constructor(
		public readonly input: ChatGatewayMessage & {
			tenantId: string
			user: IUser
		}
	) {}
}
