import { IUser } from '@metad/contracts'
import { PaginationParams, RequestContext, TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WorkspacePublicDTO } from './dto'
import { XpertWorkspace } from './workspace.entity'

@Injectable()
export class XpertWorkspaceService extends TenantOrganizationAwareCrudService<XpertWorkspace> {
	readonly #logger = new Logger(XpertWorkspaceService.name)

	constructor(
		@InjectRepository(XpertWorkspace)
		repository: Repository<XpertWorkspace>
	) {
		super(repository)
	}

	async findAllMy(options: PaginationParams<XpertWorkspace>) {
		const user = RequestContext.currentUser()
		const organizationId = RequestContext.getOrganizationId()

		const workspaces = await this.repository
			.createQueryBuilder('workspace')
			.leftJoinAndSelect('workspace.members', 'member')
			.where('workspace.ownerId = :ownerId', { ownerId: user.id })
			.andWhere('workspace.tenantId = :tenantId', { tenantId: user.tenantId })
			.andWhere('workspace.organizationId = :organizationId', { organizationId })
			.orWhere('member.id = :userId', { userId: user.id })
			.andWhere('member.tenantId = :tenantId', { tenantId: user.tenantId })
			.getMany()

		return {
			items: workspaces.map((item) => new WorkspacePublicDTO(item))
		}
	}

	async updateMembers(id: string, members: string[]) {
		const workspace = await this.findOne(id)
		workspace.members = members.map((id) => ({ id }) as IUser)
		await this.repository.save(workspace)

		return await this.findOne(id, { relations: ['members'] })
	}
}
