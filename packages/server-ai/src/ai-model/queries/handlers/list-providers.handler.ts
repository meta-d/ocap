import { CommandBus, IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { AIProvidersService } from '../../providers.service'
import { ListModelProvidersQuery } from '../list-providers.query'

@QueryHandler(ListModelProvidersQuery)
export class ListModelProvidersHandler implements IQueryHandler<ListModelProvidersQuery> {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly service: AIProvidersService
	) {}

	public async execute(command: ListModelProvidersQuery) {
		return this.service.getAllProviders().map((p) => p.getProviderSchema())
	}
}
