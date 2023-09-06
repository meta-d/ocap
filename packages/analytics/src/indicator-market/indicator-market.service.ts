import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
	RequestContext,
	TenantOrganizationAwareCrudService,
	Employee
} from '@metad/server-core'
import { FindManyOptions, Repository } from 'typeorm'
import { IndicatorMarket } from './indicator-market.entity'

@Injectable()
export class IndicatorMarketService extends TenantOrganizationAwareCrudService<IndicatorMarket> {
	constructor(
		@InjectRepository(IndicatorMarket)
		imRepository: Repository<IndicatorMarket>,
		@InjectRepository(Employee)
		protected readonly employeeRepository: Repository<Employee>
	) {
		super(imRepository, employeeRepository)
	}

	
}
