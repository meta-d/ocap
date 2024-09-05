import { IChatConversation } from '@metad/contracts'
import { ICommand } from '@nestjs/cqrs'

export class ChatConversationCreateCommand implements ICommand {
	static readonly type = '[Chat Conversation] Create'

	constructor(
		public readonly input: {
			entity: Partial<IChatConversation>
		}
	) {}
}
