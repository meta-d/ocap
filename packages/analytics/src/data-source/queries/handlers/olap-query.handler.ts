import { createQueryRunnerByType } from '@metad/adapter'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import * as _axios from 'axios'
import { AxiosResponse } from 'axios'
import { DataSourceService } from '../../data-source.service'
import { prepareDataSource } from '../../utils'
import { DataSourceOlapQuery } from '../olap.query'

const axios = _axios.default

@QueryHandler(DataSourceOlapQuery)
export class OlapQueryHandler implements IQueryHandler<DataSourceOlapQuery> {
	private readonly logger = new Logger(OlapQueryHandler.name)

	constructor(private readonly dsService: DataSourceService, private configService: ConfigService) {}

	async execute(query: DataSourceOlapQuery) {
		const { id, dataSourceId, body, forceRefresh, acceptLanguage } = query.input
		const user = query.user

		this.logger.debug(`Executing OLAP query [${id}] for dataSource: ${dataSourceId}`)

		let dataSource = await this.dsService.findOne(dataSourceId, {
			relations: ['type', 'authentications']
		})

		if (dataSource.type.protocol !== 'xmla') {
			const olapHost = this.configService.get<string>('OLAP_HOST') || 'localhost'
			const olapPort = this.configService.get<string>('OLAP_PORT') || '8080'
			const result = await axios.post(`http://${olapHost}:${olapPort}/xmla`, body, {
				headers: {
					Accept: 'text/xml, application/xml, application/soap+xml',
					'Accept-Language': acceptLanguage || '',
					'Content-Type': 'text/xml'
				}
			})
			return result.data
		}

		// Determine the user authentication
		dataSource = prepareDataSource(dataSource, user?.id)
		const runner = createQueryRunnerByType(dataSource.type.type, dataSource.options)
		try {
			const result: AxiosResponse<any> = (await runner.runQuery(body, {
				headers: { 'Accept-Language': acceptLanguage || '' }
			})) as AxiosResponse<any>

			return {
				data: result.data,
				cache: false
			}
		} finally {
			await runner.teardown()
		}
	}
}
