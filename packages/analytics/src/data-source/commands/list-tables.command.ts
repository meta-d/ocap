import { RunnableConfig } from '@langchain/core/runnables'
import { CopilotToolContext } from '@metad/contracts'
import { ICommand } from '@nestjs/cqrs'

export class ListTablesCommand implements ICommand {
	static readonly type = '[DataSource] List Tables'

	constructor(
		public readonly args: {
			//
		},
		public readonly config: RunnableConfig,
		public readonly context: CopilotToolContext
	) {}
}
