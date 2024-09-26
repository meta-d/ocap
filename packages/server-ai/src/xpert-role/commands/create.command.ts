import { IXpertRole } from '@metad/contracts'
import { ICommand } from '@nestjs/cqrs'

export class XpertRoleCreateCommand implements ICommand {
	static readonly type = '[Xpert Role] Create'

	constructor(public readonly input: Partial<IXpertRole>) { }
}
