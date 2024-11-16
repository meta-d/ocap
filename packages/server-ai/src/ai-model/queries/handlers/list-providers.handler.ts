import { CommandBus, IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { AIProvidersService } from '../../ai-model.service'
import { ListModelProvidersQuery } from '../list-providers.query'

@QueryHandler(ListModelProvidersQuery)
export class ListModelProvidersHandler implements IQueryHandler<ListModelProvidersQuery> {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly service: AIProvidersService
	) {}

	public async execute(command: ListModelProvidersQuery) {
		const names = command.names
		return this.service.getAllProviders()
			.filter((provider) => names ? names.includes(provider.name) : true)
			.map((p) => p.getProviderSchema())
	}
}
