import { ChatGatewayMessage, IUser } from '@metad/contracts'
import { ICommand } from '@nestjs/cqrs'

export class ChatWSCommand implements ICommand {
	static readonly type = '[Chat] Websocket Message'

	constructor(
		public readonly input: ChatGatewayMessage & {
			tenantId: string
			user: IUser
		}
	) {}
}
