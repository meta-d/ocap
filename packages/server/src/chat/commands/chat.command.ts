import { ChatUserMessage, IUser } from '@metad/contracts'
import { ICommand } from '@nestjs/cqrs'

export class ChatCommand implements ICommand {
	static readonly type = '[Chat] Message'

	constructor(
		public readonly input: {
			tenantId: string
			organizationId: string
			user: IUser
			message: ChatUserMessage
		}
	) {}
}
