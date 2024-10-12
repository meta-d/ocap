import { IXpertRole, TXpertTeamDraft, TXpertTeamNode } from '@metad/contracts'
import { omit, pick } from '@metad/server-common'
import { HttpException, Logger, NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { assign } from 'lodash'
import { IsNull, Not } from 'typeorm'
import { XpertRole } from '../../xpert-role.entity'
import { XpertRoleService } from '../../xpert-role.service'
import { XpertRolePublishCommand } from '../publish.command'
import { nonNullable } from '@metad/copilot'

@CommandHandler(XpertRolePublishCommand)
export class XpertRolePublishHandler implements ICommandHandler<XpertRolePublishCommand> {
	readonly #logger = new Logger(XpertRolePublishHandler.name)

	constructor(private readonly roleService: XpertRoleService) {}

	public async execute(command: XpertRolePublishCommand): Promise<XpertRole> {
		const id = command.id
		const xpertRole = await this.roleService.findOne(id, { relations: ['members'] })

		if (!xpertRole.draft) {
			throw new NotFoundException(`No drafts found`)
		}

		const { items: allVersionRoles } = await this.roleService.findAll({
			where: {
				workspaceId: xpertRole.workspaceId,
				name: xpertRole.name
			}
		})

		const allVersions = allVersionRoles.map((role) => {
			return role.version
		})

		if (allVersionRoles.length === 1) {
			xpertRole.latest = true
		}

		const currentVersion = xpertRole.version
		let version = null
		if (currentVersion) {
			const versions = currentVersion.split('.')
			versions[versions.length - 1] = `${Number(versions[versions.length - 1]) + 1}`
			version = versions.join('.')
			let index = 0
			while (allVersions.includes(version)) {
				index++
				version = currentVersion + '.' + index
			}
		} else {
			// 初始没有版本，直接保存
			version = '1'
		}

		// Check
		const draft = xpertRole.draft
		this.check(draft)

		if (currentVersion) {
			await this.saveTeamVersion(xpertRole, version)
		}
		
		xpertRole.version = version
		xpertRole.draft = null
		xpertRole.publishAt = new Date()
		// await this.roleService.save(xpertRole)
		// xpertRole.members = []

		await this.publish(xpertRole, version, draft)

		return xpertRole
	}

	async saveTeamVersion(team: XpertRole, version: string) {
		team.draft = null
		const oldTeam = {
			...omit(team, 'id'),
			latest: false,
		}

		team.version = version
		await this.roleService.save(team)

		const newTeam = await this.roleService.create(oldTeam)

		const { items } = await this.roleService.findAll({
			where: {
				id: Not(team.id),
				workspaceId: team.workspaceId,
				teamRoleId: team.id,
				version: team.version ?? IsNull()
			},
			relations: ['members']
		})

		for await (const role of items) {
			await this.saveTeamMemberVersion(role, version, newTeam, items, {})
		}
	}

	async saveTeamMemberVersion(
		role: IXpertRole,
		version: string,
		team: IXpertRole,
		members: IXpertRole[],
		mapNew: Record<string, string>
	) {
		const newMembers = []
		for await (const member of role.members) {
			if (mapNew[member.id]) {
				newMembers.push({ id: mapNew[member.id] })
			} else if (member.workspaceId === role.workspaceId && member.teamRoleId === role.teamRoleId) {
				const index = members.findIndex((item) => item.id === member.id)
				if (index > -1 && members[index].id !== role.id) {
					const _member = members[index]
					members[index] = null
					const newMember = await this.saveTeamMemberVersion(_member, version, team, members, mapNew)
					mapNew[_member.id] = newMember.id
				}
			}
		}

		const oldRole = {
			...omit(role, 'id'),
			latest: false,
			teamRoleId: team.id,
			members: newMembers
		}
		role.version = version
		await this.roleService.save(role as XpertRole)
		return await this.roleService.create(oldRole)
	}

	// async createNewMember(team: IXpertRole, version: string, role: IXpertRole) {
	// 	const result = await this.roleService.findOneOrFail({
	// 		where: {
	// 			workspaceId: team.workspaceId,
	// 			teamRoleId: team.id,
	// 			version: version,
	// 			name: role.name
	// 		}
	// 	})
	// 	if (result.success) {
	// 		return result.record
	// 	}

	// 	const newMembers = []
	// 	if (role.members) {
	// 		for await (const member of role.members) {
	// 			if (!member.id) {
	// 				newMembers.push(await this.createNewMember(team, version, member))
	// 			} else {
	// 				newMembers.push(member)
	// 			}
	// 		}
	// 	}
	// 	return await this.roleService.create({
	// 		...omit(role, 'id'),
	// 		workspaceId: team.workspaceId,
	// 		teamRoleId: team.id,
	// 		version,
	// 		members: newMembers
	// 	})
	// }

	// 检查
	// 先创建或修改或删除
	// 再维护members 关系
    async publish(team: IXpertRole, version: string, draft: TXpertTeamDraft) {

		// All members in this team
		const { items } = await this.roleService.findAll({
			where: {
				id: Not(team.id),
				workspaceId: team.workspaceId,
				teamRoleId: team.id,
				version: team.version ?? IsNull()
			},
			relations: ['members']
		})

		// CURD members
		const roleNodes = draft.nodes.filter((node) => node.type === 'role') as (TXpertTeamNode & {type: 'role'})[]
		const rolesMap = {}
		for await (const node of roleNodes) {
			if (!node.entity.id) {
				const entity = await this.roleService.create({
					...node.entity,
					version,
					teamRoleId: team.id,
					workspaceId: team.workspaceId,
				})
				rolesMap[node.key] = {
					node,
					entity
				}
			} else {
				let entity = null
				if (node.entity.id === team.id) {
					entity = team
					assign(
						entity,
						pick(
							draft.team,
							'title',
							'titleCN',
							'description',
							'prompt',
							'starters',
							'avatar',
							'options',
						)
					)
					entity.teamRoleId = team.id
				} else if (node.entity.teamRoleId === team.id) {
					entity = await this.roleService.findOne(node.entity.id)
					assign(entity, node.entity)
					entity.version = version
				}
				
				if (entity) {
					await this.roleService.save(entity)
					rolesMap[node.key] = {
						node,
						entity
					}
				}
			}
		}
		// Delete members
		for await (const oldEntity of items) {
			if (!rolesMap[oldEntity.id]) {
				await this.roleService.delete(oldEntity.id)
			}
		}

		// Update relations
		for await (const key of Object.keys(rolesMap)) {
			const { node, entity } = rolesMap[key]
			entity.members = draft.connections.filter((conn) => conn.type === 'role' && conn.from === node.key)
											.map((conn) => rolesMap[conn.to]?.entity).filter(nonNullable)
			entity.knowledgebases = draft.connections.filter((conn) => conn.type === 'knowledge' && conn.from === node.key)
											.map((conn) => draft.nodes.find((_) => _.type === 'knowledge' && _.key === conn.to)?.entity)
											.filter(nonNullable)
			await this.roleService.save(entity)
		}
	}

	check(draft: TXpertTeamDraft) {
		// Check all nodes have been connected
		draft.nodes.forEach((node) => {
			if (!draft.connections.some((connection) => connection.from === node.key || connection.to === node.key)) {
				throw new HttpException(`有游离的 Xpert！`, 500)
			}
		})
	}
}
