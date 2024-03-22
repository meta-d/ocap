import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Repository } from 'typeorm'
import { ModelQuery } from './query.entity'

@Injectable()
export class ModelQueryService extends TenantOrganizationAwareCrudService<ModelQuery> {
	constructor(
		@InjectRepository(ModelQuery)
		modelQueryRepository: Repository<ModelQuery>,
	) {
		super(modelQueryRepository)
	}
	
}
