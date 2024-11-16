import { TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CopilotProviderModel } from './copilot-provider-model.entity'


@Injectable()
export class CopilotProviderModelService extends TenantOrganizationAwareCrudService<CopilotProviderModel> {
	constructor(
		@InjectRepository(CopilotProviderModel)
		repository: Repository<CopilotProviderModel>
	) {
		super(repository)
	}
}
