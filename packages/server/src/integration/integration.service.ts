import { Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TenantOrganizationAwareCrudService } from './../core/crud'
import { Integration } from './integration.entity'

@Injectable()
export class IntegrationService extends TenantOrganizationAwareCrudService<Integration> {
	constructor(
		@InjectRepository(Integration)
		private readonly integrationRepository: Repository<Integration>,
		private readonly commandBus: CommandBus
	) {
		super(integrationRepository)
	}
}
