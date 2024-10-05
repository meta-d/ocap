import { TenantOrganizationAwareCrudService } from '@metad/server-core'
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { assign } from 'lodash'
import { In, Repository } from 'typeorm'
import { KnowledgebaseService } from '../knowledgebase'
import { XpertRole } from './xpert-role.entity'

@Injectable()
export class XpertRoleService extends TenantOrganizationAwareCrudService<XpertRole> {
	readonly #logger = new Logger(XpertRoleService.name)

	constructor(
		@InjectRepository(XpertRole)
		repository: Repository<XpertRole>,
		@Inject(forwardRef(() => KnowledgebaseService))
		private readonly knowledgebaseService: KnowledgebaseService,
		private readonly commandBus: CommandBus
	) {
		super(repository)
	}

	async update(id: string, entity: Partial<XpertRole>) {
		const _entity = await super.findOne(id)
		assign(_entity, entity)
		return await this.repository.save(_entity)
	}

	// async updateKnowledgebases(roleId: string, knowledgebases: string[]): Promise<XpertRole> {
	// 	const role = await super.findOne({ where: { id: roleId }, relations: ['knowledgebases'] })
	// 	const _knowledgebases = await this.knowledgebaseService.findAll({
	// 		where: {
	// 			id: In(knowledgebases)
	// 		}
	// 	})

	// 	role.knowledgebases = _knowledgebases.items
	// 	return await this.repository.save(role)
	// }
}
