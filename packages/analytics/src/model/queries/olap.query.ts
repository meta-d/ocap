import { IQuery } from '@nestjs/cqrs'

export class ModelOlapQuery implements IQuery {
	static readonly type = '[SemanticModel] olap'

	constructor(
		public readonly input: {
			id: string
			dataSourceId: string;
			modelId: string
			body: string
			forceRefresh: boolean
			acceptLanguage?: string
		}
	) {}
}
