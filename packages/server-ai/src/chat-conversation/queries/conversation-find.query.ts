import { IChatConversation } from '@metad/contracts'
import { IQuery } from '@nestjs/cqrs'

export class FindChatConversationQuery implements IQuery {
	static readonly type = '[Chat Conversation] Find One'

	constructor(public readonly input: Partial<IChatConversation>) {}
}
