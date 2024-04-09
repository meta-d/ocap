import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import * as _axios from 'axios'
import { DataSourceService } from '../../data-source.service'
import { DataSourceOlapQuery } from '../olap.query'

const axios = _axios.default

@QueryHandler(DataSourceOlapQuery)
export class OlapQueryHandler implements IQueryHandler<DataSourceOlapQuery> {
	private readonly logger = new Logger(OlapQueryHandler.name)

	constructor(private readonly dsService: DataSourceService, private configService: ConfigService) {}

	async execute(query: DataSourceOlapQuery) {
		const { dataSourceId, body, forceRefresh, acceptLanguage } = query.input

		this.logger.log(`Executing OLAP query for dataSourceId: ${dataSourceId}`)
		const dataSource = await this.dsService.findOne(dataSourceId, {
			relations: ['type']
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

		const result = await this.dsService.query(dataSource.id, body, {
			headers: { 'Accept-Language': acceptLanguage || '' }
		})
		return {
			data: result.data,
			cache: false
		}
	}
}
