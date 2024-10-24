import { ICommand } from '@nestjs/cqrs'

export class XpertAgentExecutionOneCommand implements ICommand {
	static readonly type = '[Xpert Agent Execution] Get One'

	constructor(public readonly id: string) {}
}
