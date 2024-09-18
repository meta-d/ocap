import { Injectable, Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CopilotOrganization } from './copilot-organization.entity'
import { ICopilotOrganization } from '@metad/contracts'
import { RequestContext, TenantAwareCrudService } from '@metad/server-core'

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
				tokenUsed: (existing.record.tokenUsed ?? 0) + (input.tokenUsed ?? 0),
				tokenLimit: input.tokenLimit ?? existing.record.tokenLimit
			})
		} else {
			await this.create({
				tenantId: input.tenantId,
				organizationId: input.organizationId,
				provider: input.provider,
				tokenUsed: input.tokenUsed ?? 0,
				tokenLimit: input.tokenLimit,
			})
		}
	}

	async renew(id: string, entity: Partial<ICopilotOrganization>) {
		const record = await this.findOne(id, { where: {
			tenantId: RequestContext.currentTenantId(),
		}})
		record.tokenTotalUsed += record.tokenUsed
		record.tokenUsed = 0
		record.tokenLimit = entity.tokenLimit
		return await this.repository.save(record)
	}
}
