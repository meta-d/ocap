import { IQuery } from '@nestjs/cqrs'

export class CopilotCheckpointGetTupleQuery implements IQuery {
	static readonly type = '[Copilot Checkpoint] GetTuple'

	constructor(
		public readonly configurable: {
			thread_id: string
			checkpoint_ns: string
			checkpoint_id?: string
		}
	) {}
}
