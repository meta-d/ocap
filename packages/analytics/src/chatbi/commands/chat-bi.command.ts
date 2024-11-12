import { CallbackManagerForToolRun } from '@langchain/core/callbacks/manager'
import { RunnableConfig } from '@langchain/core/runnables'
import { ICommand } from '@nestjs/cqrs'

export class ChatBIToolCommand implements ICommand {
	static readonly type = '[ChatBI] Chat'

	constructor(
		public readonly args: {
			input: string
		},
		public readonly runManager?: CallbackManagerForToolRun,
		public readonly parentConfig?: RunnableConfig,
	) {}
}
