import { IXpertRole } from '@metad/contracts'
import { omit, pick } from '@metad/server-common'
import { Logger, NotFoundException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { assign } from 'lodash'
import { IsNull } from 'typeorm'
import { XpertRole } from '../../xpert-role.entity'
import { XpertRoleService } from '../../xpert-role.service'
import { XpertRolePublishCommand } from '../publish.command'

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
				key: xpertRole.key,
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

		if (currentVersion) {
			await this.saveTeamVersion(xpertRole, currentVersion)
		}

		xpertRole.version = version
		xpertRole.members = []
		const team = xpertRole.draft.team
		if (team.members) {
			for await (const member of team.members) {
				const newMember = await this.createNewMember(xpertRole, version, member)
				xpertRole.members.push(newMember)
			}
		}
		assign(
			xpertRole,
			pick(
				team,
				'title',
				'titleCN',
				'description',
				'prompt',
				'starters',
				'avatar',
				'options',
				'toolsets',
				'knowledgebases'
			)
		)

		xpertRole.draft = null

		return await this.roleService.save(xpertRole)
	}

	async saveTeamVersion(team: XpertRole, version: string) {
		const { items } = await this.roleService.findAll({
			where: {
				workspaceId: team.workspaceId,
				teamRoleId: team.id,
				version: team.version ?? IsNull()
			},
			relations: ['members']
		})
		if (!items.find((item) => item.id === team.id)) {
			items.push(team)
		}
		for await (const role of items) {
			await this.saveTeamMemberVersion(role, version, items, {})
		}
	}

	async saveTeamMemberVersion(
		role: IXpertRole,
		version: string,
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
					const newMember = await this.saveTeamMemberVersion(_member, version, members, mapNew)
					mapNew[_member.id] = newMember.id
				}
			}
		}

		return await this.roleService.create({
			...omit(role, 'id'),
			version,
			latest: false,
			members: newMembers
		})
	}

	async createNewMember(team: IXpertRole, version: string, role: IXpertRole) {
		const result = await this.roleService.findOneOrFail({
			where: {
				workspaceId: team.workspaceId,
				teamRoleId: team.id,
				version: version,
				key: role.key
			}
		})
		if (result.success) {
			return result.record
		}

		const newMembers = []
		if (role.members) {
			for await (const member of role.members) {
				if (!member.id) {
					newMembers.push(await this.createNewMember(team, version, member))
				} else {
					newMembers.push(member)
				}
			}
		}
		return await this.roleService.create({
			...omit(role, 'id'),
			workspaceId: team.workspaceId,
			teamRoleId: team.id,
			version,
			members: newMembers
		})
	}
}
