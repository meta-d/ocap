import { IQuery } from '@nestjs/cqrs'

export class ListBuiltinToolProvidersQuery implements IQuery {
	static readonly type = '[Xpert Toolset] List Builtin Providers'

	constructor(
		public readonly names?: string[],
		public readonly tags?: string[]) {}
}
