import { IQuery } from '@nestjs/cqrs'

export class DataSourceOlapQuery implements IQuery {
	static readonly type = '[DataSource] olap'

	constructor(
		public readonly input: {
			id: string
			dataSourceId: string;
			body: string
			forceRefresh: boolean
			acceptLanguage?: string
		}
	) {}
}
