import { ICommand } from '@nestjs/cqrs'

/**
 * @deprecated use XpertAgentExecutionOneQuery
 */
export class XpertAgentExecutionOne1Command implements ICommand {
	static readonly type = '[Xpert Agent Execution] Get One'

	constructor(public readonly id: string) {}
}
