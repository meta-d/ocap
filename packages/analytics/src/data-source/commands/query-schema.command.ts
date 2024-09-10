import { RunnableConfig } from '@langchain/core/runnables'
import { CopilotToolContext } from '@metad/contracts'
import { ICommand } from '@nestjs/cqrs'

export class QuerySchemaCommand implements ICommand {
	static readonly type = '[DataSource] Query Schema'

	constructor(
		public readonly args: {
			dataSourceId: string
			schema: string
			tables: string[]
		},
		public readonly config: RunnableConfig,
		public readonly context: CopilotToolContext
	) {}
}
