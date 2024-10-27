import { IChatConversation } from '@metad/contracts'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { ChatConversationService } from '../../conversation.service'
import { FindChatConversationQuery } from '../conversation-find.query'

@QueryHandler(FindChatConversationQuery)
export class FindChatConversationHandler implements IQueryHandler<FindChatConversationQuery> {
	constructor(private readonly service: ChatConversationService) {}

	public async execute(command: FindChatConversationQuery): Promise<IChatConversation> {
		return await this.service.findOne({ where: command.input, relations: command.relations })
	}
}
