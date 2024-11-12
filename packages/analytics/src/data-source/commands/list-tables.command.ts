import { RunnableConfig } from '@langchain/core/runnables'
import { XpertToolContext } from '@metad/contracts'
import { ICommand } from '@nestjs/cqrs'

export class ListTablesCommand implements ICommand {
	static readonly type = '[DataSource] List Tables'

	constructor(
		public readonly args: {
			dataSource: string
			schema: string
		},
		public readonly config: RunnableConfig,
		public readonly context: XpertToolContext
	) {}
}
