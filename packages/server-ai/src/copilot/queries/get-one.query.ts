import { IQuery } from '@nestjs/cqrs'

export class CopilotGetOneQuery implements IQuery {
	static readonly type = '[Copilot] Get One'

	constructor(public readonly id: string) {}
}
