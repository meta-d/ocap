import { createQueryRunnerByType } from '@metad/adapter'
import { ChatService } from '@metad/server-ai'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { DataSourceService } from '../../data-source.service'
import { QuerySchemaCommand } from '../query-schema.command'

@CommandHandler(QuerySchemaCommand)
export class QuerySchemaHandler implements ICommandHandler<QuerySchemaCommand> {
	constructor(
		private readonly chatService: ChatService,
		private readonly dataSourceService: DataSourceService
	) {
		this.chatService.registerCommand('QuerySchema', QuerySchemaCommand)
	}

	public async execute(command: QuerySchemaCommand): Promise<string> {
		const { tables } = command.args
		const { roleContext } = command.context
		const { dataSourceId, schema } = roleContext ?? {}
		const isDev = process.env.NODE_ENV === 'development'
		
		const dataSource = await this.dataSourceService.prepareDataSource(dataSourceId)

		const runner = createQueryRunnerByType(dataSource.type.type, {
			...dataSource.options,
			debug: isDev,
			trace: isDev
		})

		try {
			let result = ''
			for await (const table of tables) {
				const tableSchema = await runner.getSchema(schema, table)
				result += `Table ${table}:\n${tableSchema}\n`
				// Query samples data
				const data = await runner.runQuery(`SELECT * FROM ${table} LIMIT 10`, { catalog: schema })
				result += `Sample data:\n` + JSON.stringify(data) + '\n\n'
			}

			return result
		} finally {
			await runner.teardown()
		}
	}
}
