import { createQueryRunnerByType } from '@metad/adapter'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { DataSourceService } from '../../data-source.service'
import { ListTablesCommand } from '../list-tables.command'
import { ChatService } from '@metad/server-ai'

@CommandHandler(ListTablesCommand)
export class ListTablesHandler implements ICommandHandler<ListTablesCommand> {
	constructor(
		private readonly chatService: ChatService,
		private readonly dataSourceService: DataSourceService
	) {
		this.chatService.registerCommand('ListTables', ListTablesCommand)
	}

	public async execute(command: ListTablesCommand): Promise<string> {
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
			const tables = await runner.getSchema(schema)
			return JSON.stringify(tables)
		} finally {
			await runner.teardown()
		}
	}
}
