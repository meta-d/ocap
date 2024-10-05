import { IXpertRole } from '@metad/contracts'
import { IQuery } from '@nestjs/cqrs'

export class FindXpertRoleQuery implements IQuery {
	static readonly type = '[Xpert Role] Find One'

	constructor(public readonly input: Partial<IXpertRole>) {}
}
