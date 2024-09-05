import { AiProviderRole } from '@metad/contracts'
import { DeepPartial } from '@metad/server-common'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { Copilot } from './copilot.entity'
import { PaginationParams, RequestContext, TenantOrganizationAwareCrudService } from '@metad/server-core'

@Injectable()
export class CopilotService extends TenantOrganizationAwareCrudService<Copilot> {
	constructor(
		@InjectRepository(Copilot)
		repository: Repository<Copilot>
	) {
		super(repository)
	}

	async findAvalibles(filter?: PaginationParams<Copilot>) {
		const { items, total } = await super.findAll(filter)
		if (items.some((item) => item.enabled)) {
			return { items, total }
		}
		return await super.findAllWithoutOrganization()
	}

	/**
	 */
	async findOneByRole(role: string, tenantId: string, organizationId: string): Promise<Copilot> {
		tenantId = tenantId || RequestContext.currentTenantId()
		organizationId = organizationId || RequestContext.getOrganizationId()
		const items = await this.repository.find({ where: { tenantId, organizationId, role } })
		return items.length ? items[0] : null
	}

	/**
	 */
	async findTenantOneByRole(role: string, tenantId: string): Promise<Copilot> {
		tenantId = tenantId || RequestContext.currentTenantId()
		const items = await this.repository.find({ where: { tenantId, role, organizationId: IsNull() } })
		return items.length ? items[0] : null
	}

	async findCopilot(tenantId: string, organizationId: string) {
		tenantId = tenantId || RequestContext.currentTenantId()
		organizationId = organizationId || RequestContext.getOrganizationId()
		let copilot = await this.findOneByRole(AiProviderRole.Secondary, tenantId, organizationId)
		if (!copilot) {
			copilot = await this.findOneByRole(AiProviderRole.Primary, tenantId, organizationId)
		}
		if (!copilot) {
			copilot = await this.findTenantOneByRole(AiProviderRole.Secondary, tenantId)
		}
		if (!copilot) {
			copilot = await this.findTenantOneByRole(AiProviderRole.Primary, tenantId)
		}
		return copilot
	}

	/**
	 * Insert or update by id or role
	 *
	 * @param entity
	 * @returns
	 */
	async upsert(entity: DeepPartial<Copilot>) {
		if (entity.id) {
			await this.update(entity.id, entity)
		} else {
			const record = await this.findOneByRole(entity.role, null, null)
			if (record) {
				await this.update(record.id, entity)
				entity.id = record.id
			} else {
				entity = await this.create(entity)
			}
		}
		return await this.findOne(entity.id)
	}
}
