import { IQuery } from '@nestjs/cqrs'

export class GetOpenAPIRemoteSchemaQuery implements IQuery {
	static readonly type = '[Xpert Toolset] Get openapi remote schema'

	constructor(
		public readonly url: string,
		public readonly credentials: Record<string, string>,
	) {}
}
