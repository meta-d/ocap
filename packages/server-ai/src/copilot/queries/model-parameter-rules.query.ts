import { ModelType } from '@metad/contracts'
import { IQuery } from '@nestjs/cqrs'

export class ModelParameterRulesQuery implements IQuery {
	static readonly type = '[Copilot] Model parameter rules'

	constructor(
		public readonly provider: string,
		public readonly modelType: ModelType,
		public readonly model: string,
	) {}
}
