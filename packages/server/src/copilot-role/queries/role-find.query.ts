import { ICopilotRole } from '@metad/contracts'
import { IQuery } from '@nestjs/cqrs'

export class FindCopilotRoleQuery implements IQuery {
	static readonly type = '[Copilot Role] Find One'

	constructor(public readonly input: Partial<ICopilotRole>) {}
}
