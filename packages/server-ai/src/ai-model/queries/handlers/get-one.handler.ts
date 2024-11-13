import { RequestContext } from '@metad/server-core'
import { CommandBus, IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { CopilotCheckLimitCommand, CopilotTokenRecordCommand } from '../../../copilot-user'
import { AIProvidersService } from '../../providers.service'
import { AIModelGetOneQuery } from '../get-one.query'

@QueryHandler(AIModelGetOneQuery)
export class AIModelGetOneHandler implements IQueryHandler<AIModelGetOneQuery> {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly service: AIProvidersService
	) {}

	public async execute(command: AIModelGetOneQuery) {
		const { abortController, tokenCallback } = command.options ?? {}
		const copilot = command.copilot
		const tenantId = RequestContext.currentTenantId()
		const organizationId = RequestContext.getOrganizationId()
		const userId = RequestContext.currentUserId()

		// Check token limit
		await this.commandBus.execute(new CopilotCheckLimitCommand({
			tenantId,
			organizationId,
			userId,
			copilot
		}))

		const copilotModel = command.copilotModel
		const modelProvider = this.service.getProvider(copilot.provider)
		return modelProvider.getModelInstance(
			copilotModel.modelType,
			{
				...copilotModel,
				copilot
			},
			{
				handleLLMTokens: async (input) => {
					if (tokenCallback) {
						tokenCallback(input.tokenUsed)
					}
					// Record token usage and abort if error
					try {
						await this.commandBus.execute(
							new CopilotTokenRecordCommand({
								...input,
								tenantId,
								organizationId,
								userId,
								copilot
							})
						)
					} catch (err) {
						if (abortController && !abortController.signal.aborted) {
							try {
								abortController.abort(err.message)
							} catch (err) {
								//
							}
						}
					}
				}
			}
		)
	}
}
