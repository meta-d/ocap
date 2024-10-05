import { RunnableConfig } from '@langchain/core/runnables'
import { XpertToolContext } from '@metad/contracts'
import { ICommand } from '@nestjs/cqrs'

export class QuerySqlCommand implements ICommand {
	static readonly type = '[DataSource] Query SQL'

	constructor(
		public readonly args: {
			query: string
		},
		public readonly config: RunnableConfig,
		public readonly context: XpertToolContext
	) {}
}
