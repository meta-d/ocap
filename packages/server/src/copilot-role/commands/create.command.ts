import { ICopilotRole } from '@metad/contracts'
import { ICommand } from '@nestjs/cqrs'

export class CopilotRoleCreateCommand implements ICommand {
	static readonly type = '[Copilot Role] Create'

	constructor(public readonly input: Partial<ICopilotRole>) { }
}
