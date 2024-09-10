import { RunnableConfig } from '@langchain/core/runnables'
import { CopilotToolContext } from '@metad/contracts'
import { ICommand } from '@nestjs/cqrs'

export class ListTablesCommand implements ICommand {
	static readonly type = '[DataSource] List Tables'

	constructor(
		public readonly args: {
			dataSourceId: string
			schema: string
		},
		public readonly config: RunnableConfig,
		public readonly context: CopilotToolContext
	) {}
}
