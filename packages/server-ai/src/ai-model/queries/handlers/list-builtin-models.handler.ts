import { CommandBus, IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { AIProvidersService } from '../../ai-model.service'
import { ListBuiltinModelsQuery } from '../list-builtin-models.query'

@QueryHandler(ListBuiltinModelsQuery)
export class ListBuiltinModelsHandler implements IQueryHandler<ListBuiltinModelsQuery> {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly service: AIProvidersService
	) {}

	public async execute(command: ListBuiltinModelsQuery) {
		const provider = this.service.getProvider(command.provider)
		const models = provider?.getProviderModels()
		return models
	}
}
