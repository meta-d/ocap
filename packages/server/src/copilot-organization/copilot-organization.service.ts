import { Injectable, Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TenantAwareCrudService } from '../core/crud'
import { CopilotOrganization } from './copilot-organization.entity'

@Injectable()
export class CopilotOrganizationService extends TenantAwareCrudService<CopilotOrganization> {
    readonly #logger = new Logger(CopilotOrganizationService.name)

    constructor(
        @InjectRepository(CopilotOrganization)
        repository: Repository<CopilotOrganization>,
        private readonly commandBus: CommandBus,
    ) {
        super(repository)
    }


	async upsert(input: Partial<CopilotOrganization>): Promise<void> {
		const existing = await this.findOneOrFail({
			tenantId: input.tenantId,
			organizationId: input.organizationId,
			provider: input.provider
		})
		if (existing.success) {
			await this.update(existing.record.id, {
				tokenUsed: existing.record.tokenUsed + (input.tokenUsed ?? 0)
			})
		} else {
			await this.create({
				tenantId: input.tenantId,
				organizationId: input.organizationId,
				provider: input.provider,
				tokenUsed: input.tokenUsed
			})
		}
	}
}
