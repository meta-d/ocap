import { IXpert, IXpertAgent, TXpertTeamDraft, TXpertTeamNode } from '@metad/contracts'
import { omit, pick } from '@metad/server-common'
import { BadRequestException, HttpException, Logger, NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { IsNull, Not, Repository } from 'typeorm'
import { Xpert } from '../../xpert.entity'
import { XpertService } from '../../xpert.service'
import { XpertPublishCommand } from '../publish.command'
import { XpertAgentService } from '../../../xpert-agent'

@CommandHandler(XpertPublishCommand)
export class XpertPublishHandler implements ICommandHandler<XpertPublishCommand> {
	readonly #logger = new Logger(XpertPublishHandler.name)

	constructor(
		// @InjectRepository(Xpert)
		// private readonly repository: Repository<Xpert>,
		private readonly xpertService: XpertService,
		private readonly xpertAgentService: XpertAgentService,
	) {}

	public async execute(command: XpertPublishCommand): Promise<Xpert> {
		const id = command.id
		const xpert = await this.xpertService.findOne(id, { relations: ['agent', 'agents', 'knowledgebases', 'toolsets'] })

		if (!xpert.draft) {
			throw new NotFoundException(`No draft found on Xpert '${xpert.name}'`)
		}

		const { items: allVersionXperts } = await this.xpertService.findAll({
			where: {
				workspaceId: xpert.workspaceId ?? IsNull(),
				name: xpert.name
			}
		})

		const allVersions = allVersionXperts.map((_) => _.version)

		if (allVersionXperts.length === 1) {
			xpert.latest = true
		}

		const currentVersion = xpert.version
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
		const draft = xpert.draft
		this.check(draft)

		// // await this.repository.queryRunner.connect()
		// // await this.repository.queryRunner.startTransaction()
		// // try {
			// Back up the current version
			if (currentVersion) {
				await this.saveTeamVersion(xpert, version)
			}

			await this.publish(xpert, version, draft)
		// 	// await this.repository.queryRunner.commitTransaction()

			return xpert
		// // } catch (err) {
		// 	// since we have errors lets rollback the changes we made
		// 	// await this.repository.queryRunner.rollbackTransaction()
		// // } finally {
		// 	// you need to release a queryRunner which was manually instantiated
		// 	// await this.repository.queryRunner.release()
		// // }

		// return null		
	}

	/**
	 * Backup current version
	 * 
	 * @param team Team (leader)
	 * @param version New version
	 */
	async saveTeamVersion(team: Xpert, version: string) {
		const oldTeam: IXpert = {
			...omit(team, 'id'),
			latest: false,
			draft: null,
			agent: null,
			agents: null
		}

		// Update to new version, leaving space for the old version as a backup
		team.version = version
		await this.xpertService.save(team)
		// backup old version
		const newTeam = await this.xpertService.create(oldTeam)

		// Copy all agents
		for await (const agent of team.agents) {
			await this.xpertAgentService.create({
				...omit(agent, 'id'),
				teamId: newTeam.id,
			})
		}
		await this.xpertAgentService.create({
			...omit(team.agent, 'id'),
			xpertId: newTeam.id,
		})
	}

	/**
	 * Publish draft of team to new version
	 * 
	 * @param xpert Xpert
	 * @param version New version
	 * @param draft Xpert draft
	 */
    async publish(xpert: Xpert, version: string, draft: TXpertTeamDraft) {
		const oldAgents = xpert.agents

		// CURD Agents
		const newAgents = []
		const agentNodes = draft.nodes.filter((node) => node.type === 'agent') as (TXpertTeamNode & {type: 'agent'})[]
		for await (const node of agentNodes) {
			const oldAgent = oldAgents.find((item) => item.key === node.key)
			// Calc the leader of agent
			const conn = draft.connections.find((_) => _.type === 'agent' && _.to === node.key)
			
			if (oldAgent) {
				if (oldAgent.updatedAt.toISOString() > `${node.entity.updatedAt}`) {
					throw new BadRequestException(`Agent 记录已有另外的更新，请重新同步`)
				} else if (oldAgent.updatedAt.toISOString() < `${node.entity.updatedAt}`) {
					// Update xpert agent
					await this.xpertAgentService.update(oldAgent.id, {
						...pickXpertAgent(node.entity),
						leaderKey: conn?.from
					})
				}
				newAgents.push(oldAgent)
			} else if (node.key === xpert.agent.key) {
				const oldAgent = xpert.agent
				if (oldAgent.updatedAt.toISOString() > `${node.entity.updatedAt}`) {
					throw new BadRequestException(`Agent 记录已有另外的更新，请重新同步`)
				} else if (oldAgent.updatedAt.toISOString() < `${node.entity.updatedAt}`) {
					// Update xpert agent
					await this.xpertAgentService.update(oldAgent.id, {
						...pickXpertAgent(node.entity),
					})
				}
			} else {
				// Create new xpert agent
				const newAgent = await this.xpertAgentService.create({
					key: node.key,
					...pickXpertAgent(node.entity),
					tenantId: xpert.tenantId,
					organizationId: xpert.organizationId,
					teamId: xpert.id,
					leaderKey: conn?.from
				})
				newAgents.push(newAgent)
			}
		}

		// Delete unused agents
		for await (const agent of oldAgents) {
			if (!newAgents.some((_) => _.id === agent.id)) {
				await this.xpertAgentService.delete(agent.id)
			}
		}

		// Update xpert
		xpert.version = version
		xpert.draft = null
		xpert.publishAt = new Date()
		xpert.agents = newAgents
		return await this.xpertService.save(xpert)
	}

	// /**
	//  * Backup xpert, backup followers firstly before backup xpert self.
	//  * 
	//  * @param role Xpert
	//  * @param version New version
	//  * @param team Team
	//  * @param members All old members
	//  * @param mapNew Store the new backup members
	//  * @returns 
	//  */
	// async saveTeamFollowerVersion(
	// 	role: IXpert,
	// 	version: string,
	// 	team: IXpert,
	// 	members: IXpert[],
	// 	mapNew: Record<string, string>
	// ) {
	// 	const newfollowers = []
	// 	for await (const member of role.followers) {
	// 		if (!mapNew[member.id] && member.workspaceId === role.workspaceId && member.teamRoleId === role.teamRoleId) {
	// 			// Backup version if follower is same workspace and same team.
	// 			const index = members.findIndex((item) => item?.id === member.id)
	// 			if (index > -1 && members[index].id !== role.id) {
	// 				const _member = members[index]
	// 				members[index] = null
	// 				await this.saveTeamFollowerVersion(_member, version, team, members, mapNew)
	// 			} else {
	// 				throw new NotFoundException(`Team ${team.title} 总的 Xpert ${role.title} 的成员 ${member.title} 在数据库记录中未找到`)
	// 			}
	// 		}
	// 		newfollowers.push({ id: mapNew[member.id] ?? member.id })
	// 	}

	// 	const oldRole = {
	// 		...omit(role, 'id'),
	// 		latest: false,
	// 		teamRoleId: team.id,
	// 		followers: newfollowers,
	// 		draft: null
	// 	}

	// 	// Update to new version, leaving space for the old version as a backup
	// 	role.version = version
	// 	await this.roleService.save(role as Xpert)
	// 	// backup old version
	// 	const backupRole = await this.roleService.create(oldRole)

	// 	mapNew[role.id] = backupRole.id

	// 	return backupRole
	// }

	// /**
	//  * Publish draft of team to new version
	//  * 
	//  * @param team Team (leader)
	//  * @param version New version
	//  * @param draft Team draft
	//  */
    // async publish(team: IXpert, version: string, draft: TXpertTeamDraft) {
	// 	// All followers in this team
	// 	const { items } = await this.roleService.findAll({
	// 		where: {
	// 			id: Not(team.id),
	// 			workspaceId: team.workspaceId ?? IsNull(),
	// 			teamRoleId: team.id,
	// 			version: version
	// 		},
	// 		relations: ['followers']
	// 	})

	// 	// CURD followers
	// 	const roleNodes = draft.nodes.filter((node) => node.type === 'role') as (TXpertTeamNode & {type: 'role'})[]
	// 	const rolesMap = {}
	// 	for await (const node of roleNodes) {
	// 		if (!node.entity.id) {
	// 			const entity = await this.roleService.create({
	// 				...node.entity,
	// 				version,
	// 				teamRoleId: team.id,
	// 				workspaceId: team.workspaceId,
	// 			})
	// 			rolesMap[node.key] = {
	// 				node,
	// 				entity
	// 			}
	// 		} else {
	// 			let entity = null
	// 			if (node.entity.id === team.id) {
	// 				// Is team leader
	// 				entity = team
	// 				assign(
	// 					entity,
	// 					pick(
	// 						draft.team,
	// 						'title',
	// 						'titleCN',
	// 						'description',
	// 						'prompt',
	// 						'starters',
	// 						'avatar',
	// 						'options',
	// 					)
	// 				)
	// 			} else if (node.entity.teamRoleId === team.id) {
	// 				entity = await this.roleService.findOne(node.entity.id)
	// 				assign(
	// 					entity, 
	// 					pick(
	// 						node.entity,
	// 						'title',
	// 						'titleCN',
	// 						'description',
	// 						'prompt',
	// 						'starters',
	// 						'avatar',
	// 						'options',
	// 					)
	// 				)
	// 			}
				
	// 			if (entity) {
	// 				entity.teamRoleId = team.id
	// 				entity.version = version
	// 				await this.roleService.save(entity)
	// 				rolesMap[node.key] = {
	// 					node,
	// 					entity
	// 				}
	// 			}
	// 		}
	// 	}
	// 	// Delete followers
	// 	for await (const oldEntity of items) {
	// 		if (!rolesMap[oldEntity.id]) {
	// 			await this.roleService.delete(oldEntity.id)
	// 		}
	// 	}

	// 	// Update relations
	// 	for await (const key of Object.keys(rolesMap)) {
	// 		const { node, entity } = rolesMap[key]
	// 		entity.followers = draft.connections.filter((conn) => conn.type === 'role' && conn.from === node.key)
	// 										.map((conn) => rolesMap[conn.to]?.entity).filter(nonNullable)
	// 		entity.knowledgebases = draft.connections.filter((conn) => conn.type === 'knowledge' && conn.from === node.key)
	// 										.map((conn) => draft.nodes.find((_) => _.type === 'knowledge' && _.key === conn.to)?.entity)
	// 										.filter(nonNullable)
	// 		entity.toolsets = draft.connections.filter((conn) => conn.type === 'toolset' && conn.from === node.key)
	// 										.map((conn) => draft.nodes.find((_) => _.type === 'toolset' && _.key === conn.to)?.entity)
	// 										.filter(nonNullable)
	// 		await this.roleService.save(entity)
	// 	}
	// }

	check(draft: TXpertTeamDraft) {
		// Check all nodes have been connected
		draft.nodes.forEach((node) => {
			if (!draft.connections.some((connection) => connection.from === node.key || connection.to === node.key)) {
				throw new HttpException(`There are free Xpert agents!`, 500)
			}
		})
	}
}

export function pickXpertAgent(agent: IXpertAgent) {
return pick(
	agent,
	'name',
	'title',
	'description',
	'avatar',
	'prompt',
	'options',
	'leaderKey', // todo
	'collaboratorNames',
	'toolsetIds',
	'knowledgebaseIds',
  )
}