import { RunnableConfig } from '@langchain/core/runnables'
import { CopilotToolContext } from '@metad/contracts'
import { ICommand } from '@nestjs/cqrs'

export class ChatBINewCommand implements ICommand {
	static readonly type = '[ChatBI] Chat'

	constructor(
		public readonly args: {
			question: string
		},
		public readonly config: RunnableConfig,
		public readonly context: CopilotToolContext
	) {}
}
