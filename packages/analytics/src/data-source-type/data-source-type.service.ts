import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AdapterBaseOptions, DBQueryRunner, QUERY_RUNNERS } from '@metad/adapter'
import { ITenant } from '@metad/contracts'
import { TenantAwareCrudService, TenantService } from '@metad/server-core'
import { environment as env } from '@metad/server-config'
import * as chalk from 'chalk'
import { Repository } from 'typeorm'
import { DataSourceType } from './data-source-type.entity'

@Injectable()
export class DataSourceTypeService extends TenantAwareCrudService<DataSourceType> {
	log = console.log
	constructor(
		@InjectRepository(DataSourceType)
		dsTypeRepository: Repository<DataSourceType>,

		private tenantService: TenantService
	) {
		super(dsTypeRepository)
	}

	async seed() {
		this.log(
			chalk.magenta(
				`🌱 SEEDING DATA SOURCE TYPES ${
					env.production ? 'PRODUCTION' : ''
				} DATABASE...`
			)
		)

		const { items = [] } = await this.tenantService.findAll()

		return items.map((tenant) => {
			return Promise.all(
				Object.entries(QUERY_RUNNERS).map(([type, QueryRunner]) => {
					const queryRunner = new QueryRunner({} as AdapterBaseOptions)
					return this.seedDataSourceType(tenant, queryRunner)
				})
			)
		})
	}

	async seedDataSourceType(tenant: ITenant, queryRunner: DBQueryRunner) {
		const dataSourceType = await this.repository.findOne({
			where: {
				tenantId: tenant.id,
				name: queryRunner.name,
			},
		})
		if (!dataSourceType) {
			return this.create({
				tenantId: tenant.id,
				name: queryRunner.name,
				type: queryRunner.type,
				syntax: queryRunner.syntax,
				protocol: queryRunner.protocol,
				configuration: queryRunner.configurationSchema,
			})
		} else {
			return Promise.resolve()
		}
	}
}
