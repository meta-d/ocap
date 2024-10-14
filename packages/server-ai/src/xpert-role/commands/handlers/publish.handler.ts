import { IXpertRole, TXpertTeamDraft, TXpertTeamNode } from '@metad/contracts'
import { omit, pick } from '@metad/server-common'
import { HttpException, Logger, NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { nonNullable } from '@metad/copilot'
import { assign } from 'lodash'
import { IsNull, Not, Repository } from 'typeorm'
import { XpertRole } from '../../xpert-role.entity'
import { XpertRoleService } from '../../xpert-role.service'
import { XpertRolePublishCommand } from '../publish.command'
import { InjectRepository } from '@nestjs/typeorm'

@CommandHandler(XpertRolePublishCommand)
export class XpertRolePublishHandler implements ICommandHandler<XpertRolePublishCommand> {
	readonly #logger = new Logger(XpertRolePublishHandler.name)

	constructor(
		@InjectRepository(XpertRole)
		private readonly repository: Repository<XpertRole>,
		private readonly roleService: XpertRoleService
	) {}

	public async execute(command: XpertRolePublishCommand): Promise<XpertRole> {
		const id = command.id
		const xpertRole = await this.repository.findOne(id, { relations: ['followers', 'knowledgebases', 'toolsets'] })

		if (!xpertRole.draft) {
			throw new NotFoundException(`No drafts found`)
		}

		const { items: allVersionRoles } = await this.roleService.findAll({
			where: {
				workspaceId: xpertRole.workspaceId ?? IsNull(),
				name: xpertRole.name
			}
		})

		const allVersions = allVersionRoles.map((role) => role.version)

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

		await this.repository.queryRunner.connect()
		await this.repository.queryRunner.startTransaction()
		try {
			// Back up the current version
			if (currentVersion) {
				await this.saveTeamVersion(xpertRole, version)
			}

			xpertRole.version = version
			xpertRole.draft = null
			xpertRole.publishAt = new Date()

			await this.publish(xpertRole, version, draft)

			await this.repository.queryRunner.commitTransaction()

			return xpertRole
		} catch (err) {
			// since we have errors lets rollback the changes we made
			await this.repository.queryRunner.rollbackTransaction()
		} finally {
			// you need to release a queryRunner which was manually instantiated
			await this.repository.queryRunner.release()
		}

		return null		
	}

	/**
	 * Backup current version
	 * 
	 * @param team Team (leader)
	 * @param version New version
	 */
	async saveTeamVersion(team: XpertRole, version: string) {
		// Retrieve all members of the current version
		const { items: backupMembers } = await this.roleService.findAll({
			where: {
				id: Not(team.id),
				workspaceId: team.workspaceId ?? IsNull(),
				teamRoleId: team.id,
				version: team.version ?? IsNull()
			},
			relations: ['followers', 'knowledgebases', 'toolsets']
		})

		// team.draft = null
		const oldTeam = {
			...omit(team, 'id'),
			latest: false,
			draft: null,
			teamRoleId: null
		}

		// Update to new version, leaving space for the old version as a backup
		team.version = version
		await this.roleService.save(team)
		// backup old version
		const newTeam = await this.roleService.create(oldTeam)
		
		// Map old id to new backup id
		const mapNew = {}
		for await (const role of backupMembers) {
			await this.saveTeamFollowerVersion(role, version, newTeam, backupMembers, mapNew)
		}

		// Update backup new team followers relations
		const newfollowers = team.followers.map((follower) => ({id: mapNew[follower.id] ?? follower.id})) as IXpertRole[]
		newTeam.followers = newfollowers
		newTeam.teamRoleId = newTeam.id
		await this.roleService.save(newTeam)
	}

	/**
	 * Backup xpert, backup followers firstly before backup xpert self.
	 * 
	 * @param role Xpert
	 * @param version New version
	 * @param team Team
	 * @param members All old members
	 * @param mapNew Store the new backup members
	 * @returns 
	 */
	async saveTeamFollowerVersion(
		role: IXpertRole,
		version: string,
		team: IXpertRole,
		members: IXpertRole[],
		mapNew: Record<string, string>
	) {
		const newfollowers = []
		for await (const member of role.followers) {
			if (mapNew[member.id]) {
				newfollowers.push({ id: mapNew[member.id] })
			} else if (member.workspaceId === role.workspaceId && member.teamRoleId === role.teamRoleId) {
				// Backup version if follower is same workspace and same team.
				const index = members.findIndex((item) => item.id === member.id)
				if (index > -1 && members[index].id !== role.id) {
					const _member = members[index]
					members[index] = null
					const newMember = await this.saveTeamFollowerVersion(_member, version, team, members, mapNew)
					mapNew[_member.id] = newMember.id
				}
			} else {
				newfollowers.push({ id: member.id })
			}
		}

		const oldRole = {
			...omit(role, 'id'),
			latest: false,
			teamRoleId: team.id,
			followers: newfollowers,
			draft: null
		}

		// Update to new version, leaving space for the old version as a backup
		role.version = version
		await this.roleService.save(role as XpertRole)
		// backup old version
		return await this.roleService.create(oldRole)
	}

	/**
	 * Publish draft of team to new version
	 * 
	 * @param team Team (leader)
	 * @param version New version
	 * @param draft Team draft
	 */
    async publish(team: IXpertRole, version: string, draft: TXpertTeamDraft) {
		// All followers in this team
		const { items } = await this.roleService.findAll({
			where: {
				id: Not(team.id),
				workspaceId: team.workspaceId ?? IsNull(),
				teamRoleId: team.id,
				version: version
			},
			relations: ['followers']
		})

		// CURD followers
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
					// Is team leader
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
				} else if (node.entity.teamRoleId === team.id) {
					entity = await this.roleService.findOne(node.entity.id)
					assign(
						entity, 
						pick(
							node.entity,
							'title',
							'titleCN',
							'description',
							'prompt',
							'starters',
							'avatar',
							'options',
						)
					)
				}
				
				if (entity) {
					entity.teamRoleId = team.id
					entity.version = version
					await this.roleService.save(entity)
					rolesMap[node.key] = {
						node,
						entity
					}
				}
			}
		}
		// Delete followers
		for await (const oldEntity of items) {
			if (!rolesMap[oldEntity.id]) {
				await this.roleService.delete(oldEntity.id)
			}
		}

		// Update relations
		for await (const key of Object.keys(rolesMap)) {
			const { node, entity } = rolesMap[key]
			entity.followers = draft.connections.filter((conn) => conn.type === 'role' && conn.from === node.key)
											.map((conn) => rolesMap[conn.to]?.entity).filter(nonNullable)
			entity.knowledgebases = draft.connections.filter((conn) => conn.type === 'knowledge' && conn.from === node.key)
											.map((conn) => draft.nodes.find((_) => _.type === 'knowledge' && _.key === conn.to)?.entity)
											.filter(nonNullable)
			entity.toolsets = draft.connections.filter((conn) => conn.type === 'toolset' && conn.from === node.key)
											.map((conn) => draft.nodes.find((_) => _.type === 'toolset' && _.key === conn.to)?.entity)
											.filter(nonNullable)
			await this.roleService.save(entity)
		}
	}

	check(draft: TXpertTeamDraft) {
		// Check all nodes have been connected
		draft.nodes.forEach((node) => {
			if (!draft.connections.some((connection) => connection.from === node.key || connection.to === node.key)) {
				throw new HttpException(`There are free Xperts!`, 500)
			}
		})
	}
}
