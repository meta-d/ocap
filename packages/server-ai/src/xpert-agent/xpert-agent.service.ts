import { TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Injectable, Logger } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { assign } from 'lodash'
import { Repository } from 'typeorm'
import { XpertAgent } from './xpert-agent.entity'

@Injectable()
export class XpertAgentService extends TenantOrganizationAwareCrudService<XpertAgent> {
	readonly #logger = new Logger(XpertAgentService.name)

	constructor(
		@InjectRepository(XpertAgent)
		repository: Repository<XpertAgent>,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {
		super(repository)
	}

	async update(id: string, entity: Partial<XpertAgent>) {
		const _entity = await super.findOne(id)
		assign(_entity, entity)
		return await this.repository.save(_entity)
	}
}
