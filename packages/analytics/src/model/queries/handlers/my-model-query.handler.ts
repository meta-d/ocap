import { Logger } from '@nestjs/common'
import { CommandBus, IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { SemanticModelQueryDTO } from '../../dto'
import { SemanticModelService } from '../../model.service'
import { ModelsQuery } from '../model.query'

@QueryHandler(ModelsQuery)
export class ModelQueryHandler implements IQueryHandler<ModelsQuery> {
	private readonly logger = new Logger(ModelQueryHandler.name)
	constructor(
		private readonly commandBus: CommandBus,
		private modelsService: SemanticModelService
	) {}

	async execute(query: ModelsQuery) {
		const { options } = query.input
		const relations = options?.relations
		
		const { items } = await this.modelsService.findMyOwn()
		return items.map((item) => new SemanticModelQueryDTO(item))
	}
}
