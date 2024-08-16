import { DeepPartial } from '@metad/server-common'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PaginationParams, TenantOrganizationAwareCrudService } from '../core/crud'
import { Copilot } from './copilot.entity'

@Injectable()
export class CopilotService extends TenantOrganizationAwareCrudService<Copilot> {
	constructor(
		@InjectRepository(Copilot)
		repository: Repository<Copilot>
	) {
		super(repository)
	}

	async findAvalibles(filter?: PaginationParams<Copilot>,) {
		const {items, total} = await super.findAll(filter)
		if (items.some((item) => item.enabled)) {
			return {items, total}
		}
		return await super.findAllWithoutOrganization()
	}

	/**
	 * @deprecated 要支持指定 orgId
	 */
	async findOneByRole(role: string): Promise<Copilot> {
		const { success, record } = await this.findOneOrFail({ where: { role } })
		return success ? record : null
	}

	/**
	 * @deprecated 要支持指定 tenantId
	 */
	async findTenantOneByRole(role: string): Promise<Copilot> {
		const { success, record } = await this.findOneOrFailWithoutOrg({ where: { role } })
		return success ? record : null
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
			const record = await this.findOneByRole(entity.role)
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
