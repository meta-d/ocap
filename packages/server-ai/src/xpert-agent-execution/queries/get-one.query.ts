import { PaginationParams } from '@metad/server-core'
import { IQuery } from '@nestjs/cqrs'
import { XpertAgentExecution } from '../agent-execution.entity'

export class XpertAgentExecutionOneQuery implements IQuery {
	static readonly type = '[Xpert Agent Execution] Get one'

	constructor(
		public readonly id: string,
		public readonly paginationParams?: Partial<PaginationParams<XpertAgentExecution>>,
	) {}
}
