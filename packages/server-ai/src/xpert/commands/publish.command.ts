import { ICommand } from '@nestjs/cqrs'

export class XpertPublishCommand implements ICommand {
	static readonly type = '[Xpert Role] Publish'

	constructor(public readonly id: string) { }
}
