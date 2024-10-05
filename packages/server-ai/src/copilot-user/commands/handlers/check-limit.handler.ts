import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { IsNull } from 'typeorm'
import { CopilotOrganizationService } from '../../../copilot-organization/index'
import { CopilotUserService } from '../../copilot-user.service'
import { CopilotCheckLimitCommand } from '../check-limit.command'

@CommandHandler(CopilotCheckLimitCommand)
export class CopilotCheckLimitHandler implements ICommandHandler<CopilotCheckLimitCommand> {
	constructor(
		private readonly copilotUserService: CopilotUserService,
		private readonly copilotOrganizationService: CopilotOrganizationService
	) {}

	public async execute(command: CopilotCheckLimitCommand): Promise<void> {
		const { input } = command
		const { copilot, tenantId, organizationId, userId } = input

		const existing = await this.copilotUserService.findOneOrFail({
			tenantId,
			organizationId,
			orgId: copilot.organizationId ?? IsNull(),
			userId,
			provider: copilot.provider
		})

		if (existing.success) {
			if (existing.record.tokenLimit && existing.record.tokenUsed >= existing.record.tokenLimit) {
				throw new Error('Token usage exceeds limit')
			}
		}

		const orgExisting = await this.copilotOrganizationService.findOneOrFail({
			tenantId: input.tenantId,
			organizationId: input.organizationId,
			provider: copilot.provider
		})
		if (orgExisting.success) {
			if (orgExisting.record.tokenLimit && orgExisting.record.tokenUsed >= orgExisting.record.tokenLimit) {
				throw new Error('Token usage of org exceeds limit')
			}
		}
	}
}
