import { IQuery } from '@nestjs/cqrs'

export class GetODataRemoteMetadataQuery implements IQuery {
	static readonly type = '[Xpert Toolset] Get odata remote metadata'

	constructor(
		public readonly url: string,
		public readonly credentials: Record<string, string>,
	) {}
}
