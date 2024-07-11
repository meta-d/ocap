import { IUser } from '@metad/contracts'
import { IQuery } from '@nestjs/cqrs'

export class ModelOlapQuery implements IQuery {
	static readonly type = '[SemanticModel] olap'

	constructor(
		public readonly input: {
			id: string
			sessionId: string
			dataSourceId: string;
			modelId: string
			body: string
			forceRefresh: boolean
			acceptLanguage?: string
		},
		public readonly user: Partial<IUser>
	) {}
}
