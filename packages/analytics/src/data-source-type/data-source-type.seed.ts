import { AdapterBaseOptions, QUERY_RUNNERS } from '@metad/adapter'
import { ITenant } from '@metad/contracts'
import { Connection } from 'typeorm'
import { DataSourceType } from './data-source-type.entity'

export const createDefaultDataSourceTypes = async (
	connection: Connection,
	tenant: ITenant
): Promise<DataSourceType[]> => {
	const types = Object.entries(QUERY_RUNNERS).map(([type, QueryRunner]) => {
		const queryRunner = new QueryRunner({} as AdapterBaseOptions)
		const dsType = new DataSourceType()
		dsType.tenant = tenant
		dsType.name = queryRunner.name
		dsType.type = queryRunner.type
		dsType.syntax = queryRunner.syntax
		dsType.protocol = queryRunner.protocol
		dsType.configuration = queryRunner.configurationSchema
		return dsType
	})

	return await connection.manager.save(types)
}
