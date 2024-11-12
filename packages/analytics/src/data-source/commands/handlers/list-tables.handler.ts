import { createQueryRunnerByType } from '@metad/adapter'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { XpertToolsetService } from '@metad/server-ai'
import { DataSourceService } from '../../data-source.service'
import { ListTablesCommand } from '../list-tables.command'

@CommandHandler(ListTablesCommand)
export class ListTablesHandler implements ICommandHandler<ListTablesCommand> {
	constructor(
		private readonly toolsetService: XpertToolsetService,
		private readonly dataSourceService: DataSourceService
	) {
		this.toolsetService.registerCommand('ListTables', ListTablesCommand)
	}

	public async execute(command: ListTablesCommand): Promise<string> {
		const { dataSource: dataSourceId, schema } = command.args
		const isDev = process.env.NODE_ENV === 'development'

		const dataSource = await this.dataSourceService.prepareDataSource(dataSourceId)

		const runner = createQueryRunnerByType(dataSource.type.type, {
			...dataSource.options,
			debug: isDev,
			trace: isDev
		})

		try {
			const tables = await runner.getSchema(schema)
			return JSON.stringify(tables)
		} finally {
			await runner.teardown()
		}
	}
}
