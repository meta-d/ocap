import { RequestContext, TenantOrganizationAwareCrudService } from '@metad/server-core'
import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { assign } from 'lodash'
import { FindConditions, IsNull, Repository } from 'typeorm'
import { KnowledgebaseService } from '../knowledgebase'
import { XpertRole } from './xpert-role.entity'
import { IUser, IXpertRole, TXpertRoleDraft } from '@metad/contracts'
import { GetXpertWorkspaceQuery } from '../xpert-workspace'
import { XpertRolePublishCommand } from './commands'
import { convertToUrlPath } from '@metad/server-common'

@Injectable()
export class XpertRoleService extends TenantOrganizationAwareCrudService<XpertRole> {
	readonly #logger = new Logger(XpertRoleService.name)

	constructor(
		@InjectRepository(XpertRole)
		repository: Repository<XpertRole>,
		@Inject(forwardRef(() => KnowledgebaseService))
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {
		super(repository)
	}

	async update(id: string, entity: Partial<XpertRole>) {
		const _entity = await super.findOne(id)
		assign(_entity, entity)
		return await this.repository.save(_entity)
	}

	async validateTitle(title: string) {
		const name = convertToUrlPath(title)
		const { items } = await this.findAll({ where: {
			name,
			latest: true
		}})

		return items
	}

	async getAllByWorkspace(workspaceId: string, data, user: IUser) {
		const { relations, order, take } = data ?? {}
		let { where } = data ?? {}
		where = where ?? {}
		if (workspaceId === 'null' || workspaceId === 'undefined' || !workspaceId) {
			where = {
				...(<FindConditions<XpertRole>>where),
				workspaceId: IsNull(),
				createdById: user.id
			}
		} else {
			const workspace = await this.queryBus.execute(new GetXpertWorkspaceQuery(user, { id: workspaceId }))
			if (!workspace) {
				throw new NotFoundException(`Not found or no auth for xpert workspace '${workspaceId}'`)
			}

			where = {
				...(<FindConditions<XpertRole>>where),
				workspaceId: workspaceId
			}
		}

		return this.findAll({
			where,
			relations,
			order,
			take
		})
	}

	async getTeam(id: string) {
		const team = await this.findOne(id, { relations: ['members', 'toolsets', 'knowledgebases'] })
		if (!team.draft) {
			const { items } = await this.findAll({ where: { workspaceId: team.workspaceId, teamRoleId: team.id }, relations: ['members', 'toolsets', 'knowledgebases'] })
			assembleXpertRole(team, items, [])
		}
		return team
	}

	async save(entity: XpertRole) {
		return await this.repository.save(entity)
	}

	async saveDraft(id: string, draft: TXpertRoleDraft) {
		const xpert = await this.findOne(id)
		xpert.draft = {
			...draft,
			team: {
				...draft.team,
				updatedAt: new Date(),
				updatedById: RequestContext.currentUserId()
			}
		} as TXpertRoleDraft

		return await this.repository.save(xpert)
	}

	async publish(id: string,) {
		return await this.commandBus.execute(new XpertRolePublishCommand(id))
	}

	async allVersions(id: string) {
		const role = await this.findOne(id)
		const { items: allVersionRoles } = await this.findAll({
			where: {
				workspaceId: role.workspaceId,
				key: role.key,
				name: role.name
			}
		})

		return allVersionRoles.map((role) => ({
			id: role.id,
			key: role.key,
			version: role.version,
			latest: role.latest
		}))
	}
}

function assembleXpertRole(role: IXpertRole, items: IXpertRole[], assembles: string[]) {
	if (assembles.includes(role.id)) {
		return role
	}
	role.members = role.members?.map((m) => items.find((item) => item.id === m.id) ?? m)

	if (role.members) {
	  for (const member of role.members) {
		assembleXpertRole(member, items, assembles)
	  }
	}

	return role
}