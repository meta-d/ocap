import { ICommand } from '@nestjs/cqrs'

export class XpertChatCommand implements ICommand {
	static readonly type = '[Xpert] Chat'

	constructor(
		public readonly input: string,
		public readonly xpertId: string,
		public readonly options?: {
			// Use xpert's draft
			isDraft?: boolean
		}
	) {}
}
