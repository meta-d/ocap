import { RunnableConfig } from '@langchain/core/runnables'
import { XpertToolContext } from '@metad/contracts'
import { ICommand } from '@nestjs/cqrs'

export class ChatBIToolCommand implements ICommand {
	static readonly type = '[ChatBI] Chat'

	constructor(
		public readonly args: {
			question: string
		},
		public readonly config: RunnableConfig,
		public readonly context: XpertToolContext
	) {}
}
