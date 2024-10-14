import { IXpert } from '@metad/contracts'
import { ICommand } from '@nestjs/cqrs'

export class XpertCreateCommand implements ICommand {
	static readonly type = '[Xpert] Create'

	constructor(public readonly input: Partial<IXpert>) { }
}
