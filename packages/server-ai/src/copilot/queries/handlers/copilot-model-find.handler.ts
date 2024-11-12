import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { AIProvidersService } from '../../../ai-model/index'
import { CopilotService } from '../../copilot.service'
import { CopilotWithProviderDto, ProviderWithModelsDto } from '../../dto'
import { FindCopilotModelsQuery } from '../copilot-model-find.query'

@QueryHandler(FindCopilotModelsQuery)
export class FindCopilotModelsHandler implements IQueryHandler<FindCopilotModelsQuery> {
	constructor(
		private readonly service: CopilotService,
		private readonly providersService: AIProvidersService
	) {}

	public async execute(command: FindCopilotModelsQuery): Promise<CopilotWithProviderDto[]> {
		const copilots = await this.service.findAllCopilots(null, null)
		const copilotSchemas: CopilotWithProviderDto[] = []
		for (const copilot of copilots) {
			const provider = this.providersService.getProvider(copilot.provider)
			if (provider) {
				const models = provider.getProviderModels(command.type)
				if (models.length) {
					const providerSchema = provider.getProviderSchema()
					copilotSchemas.push(
						new CopilotWithProviderDto({
							...copilot,
							providerWithModels: new ProviderWithModelsDto({
								...providerSchema,
								models
							})
						})
					)
				}
			}
			// else {
			// 	copilotSchemas.push({
			// 		...copilot
			// 	})
			// }
		}

		return copilotSchemas
	}
}
