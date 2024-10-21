import { IQuery } from '@nestjs/cqrs'

export class GetXpertAgentQuery implements IQuery {
	static readonly type = '[Xpert] Get one agent'

	constructor(
        public readonly id: string,
        public readonly agentKey: string,
        public readonly version?: string
    ) {}
}
