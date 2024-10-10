import { ICommand } from '@nestjs/cqrs'

export class XpertRolePublishCommand implements ICommand {
	static readonly type = '[Xpert Role] Publish'

	constructor(public readonly id: string) { }
}
