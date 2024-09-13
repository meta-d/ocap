import { CopilotRoleService } from '@metad/server-ai'
import { TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Injectable, Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { ChatBIModel } from './chatbi-model.entity'

@Injectable()
export class ChatBIModelService extends TenantOrganizationAwareCrudService<ChatBIModel> {
	private readonly logger = new Logger(ChatBIModelService.name)

	constructor(
		@InjectRepository(ChatBIModel)
		repository: Repository<ChatBIModel>,
		private readonly roleService: CopilotRoleService,
		readonly commandBus: CommandBus
	) {
		super(repository)
	}

	async visit(modelId: string, entity: string) {
		const record = await this.findOneByConditions({ modelId, entity })
		record.visits = (record.visits ?? 0) + 1
		await this.repository.save(record)
	}

	async updateRoles(modelId: string, roles: string[]) {
		const model = await super.findOne({ where: { id: modelId }, relations: ['roles'] })

		const _roles = await this.roleService.findAll({
			where: {
				id: In(roles)
			}
		})

		model.roles = _roles.items
		return await this.repository.save(model)
	}

}
