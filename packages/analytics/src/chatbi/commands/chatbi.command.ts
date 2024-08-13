import { ICommand } from '@nestjs/cqrs'

export class ChatBICommand implements ICommand {
	static readonly type = '[ChatBI] Message'

	constructor(
		public readonly input: {
			tenantId: string,
			conversationId: string,
			text: string
		}
	) {}
}
