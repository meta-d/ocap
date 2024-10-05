import { TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Injectable, Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { XpertToolset } from './xpert-toolset.entity'

@Injectable()
export class XpertToolsetService extends TenantOrganizationAwareCrudService<XpertToolset> {
	readonly #logger = new Logger(XpertToolsetService.name)

	constructor(
		@InjectRepository(XpertToolset)
		repository: Repository<XpertToolset>,
		private readonly commandBus: CommandBus
	) {
		super(repository)
	}
}
