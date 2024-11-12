import { RunnableConfig } from '@langchain/core/runnables'
import { ICommand } from '@nestjs/cqrs'

export class DataSourcePingCommand implements ICommand {
	static readonly type = '[DataSource] Ping'

	constructor(
		public readonly args: {
			dataSource: string
			schema: string
		},
		public readonly config: RunnableConfig,
	) {}
}
