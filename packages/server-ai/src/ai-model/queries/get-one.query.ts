import { ICopilot } from '@metad/contracts'
import { IQuery } from '@nestjs/cqrs'

export class AIModelGetOneQuery implements IQuery {
	static readonly type = '[AI Model] Get One'

	constructor(public readonly copilot: ICopilot) {}
}
