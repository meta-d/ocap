import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { AIProvidersService } from '../../../ai-model/index'
import { CopilotService } from '../../copilot.service'
import { ModelParameterRulesQuery } from '../model-parameter-rules.query'

@QueryHandler(ModelParameterRulesQuery)
export class ModelParameterRulesHandler implements IQueryHandler<ModelParameterRulesQuery> {
	constructor(
		private readonly service: CopilotService,
		private readonly providersService: AIProvidersService
	) {}

	public async execute(command: ModelParameterRulesQuery): Promise<any[]> {
		const { provider, modelType, model } = command

		const modelProvider = this.providersService.getProvider(provider)

		return modelProvider.getModelInstance(modelType)?.getParameterRules(model, null)
	}
}
