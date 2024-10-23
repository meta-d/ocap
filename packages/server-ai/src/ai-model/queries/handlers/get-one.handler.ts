import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { AIProvidersService } from '../../providers.service'
import { AIModelGetOneQuery } from '../get-one.query'

@QueryHandler(AIModelGetOneQuery)
export class AIModelGetOneHandler implements IQueryHandler<AIModelGetOneQuery> {
	constructor(private readonly service: AIProvidersService) {}

	public async execute(command: AIModelGetOneQuery): Promise<BaseChatModel> {
		const modelProvider = this.service.getProvider(command.copilot.provider)
		return modelProvider.getChatModel(command.copilot, command.copilotModel)
	}
}
