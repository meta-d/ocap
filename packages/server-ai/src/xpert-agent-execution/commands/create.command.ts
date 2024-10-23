import { IXpertAgentExecution } from '@metad/contracts'
import { ICommand } from '@nestjs/cqrs'

export class XpertAgentExecutionCreateCommand implements ICommand {
	static readonly type = '[Xpert Agent Execution] Create'

	constructor(public readonly execution: Partial<IXpertAgentExecution>) {}
}
