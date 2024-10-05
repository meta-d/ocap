import { IChatConversation } from '@metad/contracts'
import { ICommand } from '@nestjs/cqrs'

export class ChatConversationUpdateCommand implements ICommand {
	static readonly type = '[Chat Conversation] Update'

	constructor(
		public readonly input: {
			id: string
			entity: Partial<IChatConversation>
		}
	) {}
}
