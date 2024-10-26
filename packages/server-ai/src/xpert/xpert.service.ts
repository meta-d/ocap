import { IUser, TXpertTeamDraft } from '@metad/contracts'
import { convertToUrlPath } from '@metad/server-common'
import { OptionParams, PaginationParams, RequestContext, TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { assign, uniq } from 'lodash'
import { FindConditions, IsNull, Not, Repository } from 'typeorm'
import { GetXpertWorkspaceQuery } from '../xpert-workspace'
import { XpertPublishCommand } from './commands'
import { Xpert } from './xpert.entity'

@Injectable()
export class XpertService extends TenantOrganizationAwareCrudService<Xpert> {
	readonly #logger = new Logger(XpertService.name)

	constructor(
		@InjectRepository(Xpert)
		repository: Repository<Xpert>,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {
		super(repository)
	}

	async update(id: string, entity: Partial<Xpert>) {
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

	async getAllByWorkspace(workspaceId: string, data: PaginationParams<Xpert>, published: boolean, user: IUser) {
		const { relations, order, take } = data ?? {}
		let { where } = data ?? {}
		where = where ?? {}
		if (workspaceId === 'null' || workspaceId === 'undefined' || !workspaceId) {
			where = {
				...(<FindConditions<Xpert>>where),
				workspaceId: IsNull(),
				createdById: user.id
			}
		} else {
			const workspace = await this.queryBus.execute(new GetXpertWorkspaceQuery(user, { id: workspaceId }))
			if (!workspace) {
				throw new NotFoundException(`Not found or no auth for xpert workspace '${workspaceId}'`)
			}

			where = {
				...(<FindConditions<Xpert>>where),
				workspaceId: workspaceId
			}
		}
		if (published) {
			where.version = Not(IsNull())
		}

		return this.findAll({
			where,
			relations,
			order,
			take
		})
	}

	async getTeam(id: string, options?: OptionParams<Xpert>) {
		const { relations } = options ?? {}
		const team = await this.findOne(id, {
			relations: uniq([...(relations ?? []), 'agents', 'toolsets', 'knowledgebases'])
		})
		return team
	}

	async save(entity: Xpert) {
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
		return await this.commandBus.execute(new XpertPublishCommand(id))
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
