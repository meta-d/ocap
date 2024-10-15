import { IKnowledgebase, IXpert, IXpertAgent, IXpertToolset, TXpertTeamDraft, TXpertTeamNode } from '@metad/contracts'
import { omit, pick } from '@metad/server-common'
import { BadRequestException, HttpException, Logger, NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { IsNull } from 'typeorm'
import { Xpert } from '../../xpert.entity'
import { XpertService } from '../../xpert.service'
import { XpertPublishCommand } from '../publish.command'
import { XpertAgentService } from '../../../xpert-agent'
import { uniq } from 'lodash'

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

		this.#logger.verbose(`Draft of xpert '${xpert.name}':\n${JSON.stringify(xpert.draft, null, 2)}`)

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

			return await this.publish(xpert, version, draft)
		// 	// await this.repository.queryRunner.commitTransaction()
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
		this.#logger.debug(`Publish Xpert '${xpert.name}' to new version '${version}'`)

		const oldAgents = xpert.agents

		// CURD Agents
		const newAgents = []
		const agentNodes = draft.nodes.filter((node) => node.type === 'agent') as (TXpertTeamNode & {type: 'agent'})[]
		const totalToolsetIds = []
		const totalKnowledgebaseIds = []
		for await (const node of agentNodes) {
			// Collect toolsetIds
			const toolsetIds = draft.connections.filter((_) => _.type === 'toolset' && _.from === node.key).map((_) => _.to)
			const knowledgebaseIds = draft.connections.filter((_) => _.type === 'knowledge' && _.from === node.key).map((_) => _.to)
			totalToolsetIds.push(...toolsetIds)
			totalKnowledgebaseIds.push(...knowledgebaseIds)

			const oldAgent = oldAgents.find((item) => item.key === node.key)
			// Calc the leader of agent
			const conn = draft.connections.find((_) => _.type === 'agent' && _.to === node.key)
			
			if (oldAgent) {
				if (oldAgent.updatedAt.toISOString() > `${node.entity.updatedAt}`) {
					throw new BadRequestException(`Agent 记录已有另外的更新，请重新同步`)
				} else {
					// Update xpert agent
					const entity = {
						...pickXpertAgent(node.entity),
						leaderKey: conn?.from,
						toolsetIds,
						knowledgebaseIds
					}
					this.#logger.verbose(`Update xpert team agent (name/key='${oldAgent.name || oldAgent.key}', id='${oldAgent.id}') with value:\n${JSON.stringify(entity, null, 2)}`)
					await this.xpertAgentService.update(oldAgent.id, entity)
				}
				newAgents.push(oldAgent)
			} else if (node.key === xpert.agent.key) {
				if (xpert.agent.updatedAt.toISOString() > `${node.entity.updatedAt}`) {
					throw new BadRequestException(`Agent 记录已有另外的更新，请重新同步`)
				}
				// Update primary agent when update xpert through OneToOne relationship
				xpert.agent = {
					...xpert.agent,
					...pickXpertAgent(node.entity),
					toolsetIds,
					knowledgebaseIds
				}
			} else {
				// Create new xpert agent
				const newAgent = await this.xpertAgentService.create({
					key: node.key,
					...pickXpertAgent(node.entity),
					tenantId: xpert.tenantId,
					organizationId: xpert.organizationId,
					teamId: xpert.id,
					leaderKey: conn?.from,
					toolsetIds,
					knowledgebaseIds
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
		xpert.active = true
		xpert.agents = newAgents
		xpert.toolsets = uniq(totalToolsetIds).map((id) => ({id} as IXpertToolset))
		xpert.knowledgebases = uniq(totalKnowledgebaseIds).map((id) => ({id} as IKnowledgebase))
		// Recording graph node positions
		xpert.options ??= {}
		draft.nodes.forEach((node) => {
			xpert.options[node.type] ??= {}
			xpert.options[node.type][node.key] ??= {}
			xpert.options[node.type][node.key].position = node.position
		})

		return await this.xpertService.save(xpert)
	}

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