import { RunnableConfig } from '@langchain/core/runnables'
import { XpertToolContext } from '@metad/contracts'
import { ICommand } from '@nestjs/cqrs'

export class QuerySchemaCommand implements ICommand {
	static readonly type = '[DataSource] Query Schema'

	constructor(
		public readonly args: {
			dataSource: string
			schema: string
			tables: string[]
		},
		public readonly config: RunnableConfig,
		public readonly context: XpertToolContext
	) {}
}
