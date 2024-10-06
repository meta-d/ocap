import { TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Injectable, Logger, Type } from '@nestjs/common'
import { CommandBus, ICommand } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { XpertToolset } from './xpert-toolset.entity'
import { CopilotService } from '../copilot'
import { AiProviderRole } from '@metad/contracts'
import { assign } from 'lodash'

@Injectable()
export class XpertToolsetService extends TenantOrganizationAwareCrudService<XpertToolset> {
	readonly #logger = new Logger(XpertToolsetService.name)

	private commands = new Map<string, Type<ICommand>>()
	
	constructor(
		@InjectRepository(XpertToolset)
		repository: Repository<XpertToolset>,
		private readonly copilotService: CopilotService,
		private readonly commandBus: CommandBus
	) {
		super(repository)
	}

	registerCommand(name: string, command: Type<ICommand>) {
		this.commands.set(name, command)
	}

	async executeCommand(name: string, ...args: any[]) {
		const command = this.commands.get(name)
		if (!command) {
			throw new Error(`Command "${name}" not found`)
		}
		return await this.commandBus.execute(new command(...args))
	}

	async findCopilot(tenantId: string, organizationId: string, role: AiProviderRole) {
		await this.copilotService.findCopilot(tenantId, organizationId, role)
	}
	
	async update(id: string, entity: Partial<XpertToolset>) {
		const _entity = await super.findOne(id)
		assign(_entity, entity)
		return await this.repository.save(_entity)
	}
}
