import { PaginationParams, TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Injectable, Logger, NotFoundException, Type } from '@nestjs/common'
import { CommandBus, ICommand, QueryBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { FindConditions, IsNull, Not, Repository } from 'typeorm'
import { XpertToolset } from './xpert-toolset.entity'
import { CopilotService } from '../copilot'
import { AiProviderRole, IUser } from '@metad/contracts'
import { assign } from 'lodash'
import { GetXpertWorkspaceQuery } from '../xpert-workspace'
import { defaultToolTags } from './utils/tags'

@Injectable()
export class XpertToolsetService extends TenantOrganizationAwareCrudService<XpertToolset> {
	readonly #logger = new Logger(XpertToolsetService.name)

	private commands = new Map<string, Type<ICommand>>()
	
	constructor(
		@InjectRepository(XpertToolset)
		repository: Repository<XpertToolset>,
		private readonly copilotService: CopilotService,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {
		super(repository)
	}

	registerCommand(name: string, command: Type<ICommand>) {
		this.commands.set(name, command)
	}

	async executeCommand(name: string, ...args: any[]) {
		const command = this.commands.get(name)
		if (!command) {
			throw new Error(`Command "${name}" not found`)
		}
		return await this.commandBus.execute(new command(...args))
	}

	async findCopilot(tenantId: string, organizationId: string, role: AiProviderRole) {
		await this.copilotService.findCopilot(tenantId, organizationId, role)
	}
	
	async update(id: string, entity: Partial<XpertToolset>) {
		const _entity = await super.findOne(id)
		assign(_entity, entity)
		return await this.repository.save(_entity)
	}
	
	async getAllByWorkspace(workspaceId: string, data: PaginationParams<XpertToolset>, published: boolean, user: IUser) {
		const { relations, order, take } = data ?? {}
		let { where } = data ?? {}
		where = where ?? {}
		if (workspaceId === 'null' || workspaceId === 'undefined' || !workspaceId) {
			where = {
				...(<FindConditions<XpertToolset>>where),
				workspaceId: IsNull(),
				createdById: user.id
			}
		} else {
			const workspace = await this.queryBus.execute(new GetXpertWorkspaceQuery(user, { id: workspaceId }))
			if (!workspace) {
				throw new NotFoundException(`Not found or no auth for xpert workspace '${workspaceId}'`)
			}

			where = {
				...(<FindConditions<XpertToolset>>where),
				workspaceId: workspaceId
			}
		}
		
		if (published) {
			where.publishAt = Not(IsNull())
		}

		return this.findAll({
			where,
			relations,
			order,
			take
		})
	}

	async getAllTags() {
		return defaultToolTags
	}
}
