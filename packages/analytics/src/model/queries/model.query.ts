import { IQuery } from '@nestjs/cqrs'

export class ModelsQuery implements IQuery {
	static readonly type = '[Model] Get'

	constructor(
		public readonly input: {
			options: any
		}
	) {}
}
