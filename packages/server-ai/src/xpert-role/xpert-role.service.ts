import { IUser, IXpertRole, TXpertTeamDraft } from '@metad/contracts'
import { convertToUrlPath } from '@metad/server-common'
import { RequestContext, TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { assign } from 'lodash'
import { FindConditions, IsNull, Repository } from 'typeorm'
import { GetXpertWorkspaceQuery } from '../xpert-workspace'
import { XpertRolePublishCommand } from './commands'
import { XpertRole } from './xpert-role.entity'

@Injectable()
export class XpertRoleService extends TenantOrganizationAwareCrudService<XpertRole> {
	readonly #logger = new Logger(XpertRoleService.name)

	constructor(
		@InjectRepository(XpertRole)
		repository: Repository<XpertRole>,
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
		const { items } = await this.findAll({
			where: {
				name,
				latest: true
			}
		})

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
		const team = await this.findOne(id, { relations: ['followers', 'toolsets', 'knowledgebases'] })
		if (!team.draft) {
			const { items } = await this.findAll({
				where: { workspaceId: team.workspaceId ?? IsNull(), teamRoleId: team.id },
				relations: ['followers', 'toolsets', 'knowledgebases']
			})
			assembleXpertRole(team, items, [])
		}
		return team
	}

	async save(entity: XpertRole) {
		return await this.repository.save(entity)
	}

	async saveDraft(id: string, draft: TXpertTeamDraft) {
		const xpert = await this.findOne(id)
		xpert.draft = {
			...draft,
			team: {
				...draft.team,
				updatedAt: new Date(),
				updatedById: RequestContext.currentUserId()
			}
		} as TXpertTeamDraft

		await this.repository.save(xpert)
		return xpert.draft
	}

	async publish(id: string) {
		return await this.commandBus.execute(new XpertRolePublishCommand(id))
	}

	async allVersions(id: string) {
		const role = await this.findOne(id)
		const { items: allVersionRoles } = await this.findAll({
			where: {
				workspaceId: role.workspaceId ?? IsNull(),
				name: role.name
			}
		})

		return allVersionRoles.map((role) => ({
			id: role.id,
			version: role.version,
			latest: role.latest
		}))
	}
	
	async deleteXpert(id: string) {
		const xpert = await this.findOne(id)

		if (xpert.latest) {
			// Delete all versions if it is latest version
			return await this.softDelete({ name: xpert.name, deletedAt: IsNull() })
		} else {
			// Delete current version team
			return await this.softDelete(xpert.id)
		}
	}
}

/**
 * Assembling the team member tree
 */
function assembleXpertRole(role: IXpertRole, items: IXpertRole[], assembles: string[]) {
	if (assembles.includes(role.id)) {
		return role
	}
	role.followers = role.followers?.map((m) => items.find((item) => item.id === m.id) ?? m)

	if (role.followers) {
		for (const follower of role.followers) {
			assembleXpertRole(follower, items, assembles)
		}
	}

	return role
}
