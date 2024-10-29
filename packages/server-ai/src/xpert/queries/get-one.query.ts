import { IXpert } from '@metad/contracts'
import { IQuery } from '@nestjs/cqrs'

export class FindXpertQuery implements IQuery {
	static readonly type = '[Xpert] Find One'

	constructor(
		public readonly input: Partial<IXpert>,
		public readonly relations?: string[]
	) {}
}
