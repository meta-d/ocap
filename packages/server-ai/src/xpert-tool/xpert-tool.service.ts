import { TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Injectable, Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { XpertTool } from './xpert-tool.entity'

@Injectable()
export class XpertToolService extends TenantOrganizationAwareCrudService<XpertTool> {
	readonly #logger = new Logger(XpertToolService.name)

	constructor(
		@InjectRepository(XpertTool)
		repository: Repository<XpertTool>,
		private readonly commandBus: CommandBus
	) {
		super(repository)
	}
}
