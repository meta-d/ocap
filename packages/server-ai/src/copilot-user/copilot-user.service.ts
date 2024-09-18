import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { CopilotUser } from './copilot-user.entity'
import { ICopilotUser } from '@metad/contracts'
import { RequestContext, TenantOrganizationAwareCrudService } from '@metad/server-core'

@Injectable()
export class CopilotUserService extends TenantOrganizationAwareCrudService<CopilotUser> {
	readonly #logger = new Logger(CopilotUserService.name)

	constructor(
		@InjectRepository(CopilotUser)
		repository: Repository<CopilotUser>,
	) {
		super(repository)
	}

	/**
	 * Record usage of copilot for user in organization
	 */
	async upsert(user: Partial<CopilotUser>): Promise<void> {
		const existing = await this.findOneOrFail({
			tenantId: user.tenantId,
			organizationId: user.organizationId,
			orgId: user.orgId ?? IsNull(),
			userId: user.userId,
			provider: user.provider
		})
		if (existing.success) {
			await this.update(existing.record.id, {
				tokenUsed: (existing.record.tokenUsed ?? 0) + (user.tokenUsed ?? 0)
			})
		} else {
			await this.create({
				tenantId: user.tenantId,
				organizationId: user.organizationId,
				orgId: user.orgId,
				userId: user.userId,
				provider: user.provider,
				tokenUsed: user.tokenUsed,
				tokenLimit: user.tokenLimit,
			})
		}
	}

	async renew(id: string, entity: Partial<ICopilotUser>) {
		const record = await this.findOne(id, { where: {
			tenantId: RequestContext.currentTenantId(),
			organizationId: RequestContext.getOrganizationId()
		}})
		record.tokenTotalUsed += record.tokenUsed
		record.tokenUsed = 0
		record.tokenLimit = entity.tokenLimit
		return await this.repository.save(record)
	}
}
