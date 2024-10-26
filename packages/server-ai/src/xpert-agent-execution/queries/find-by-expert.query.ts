import { PaginationParams } from '@metad/server-core'
import { IQuery } from '@nestjs/cqrs'
import { XpertAgentExecution } from '../agent-execution.entity'

export class FindExecutionsByXpertQuery implements IQuery {
	static readonly type = '[Xpert Agent Execution] Find by Xpert'

	constructor(
		public readonly xpertId: string,
		public readonly paginationParams: Partial<PaginationParams<XpertAgentExecution>>,
	) {}
}
