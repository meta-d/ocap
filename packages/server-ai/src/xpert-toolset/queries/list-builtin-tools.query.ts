import { IQuery } from '@nestjs/cqrs'

export class ListBuiltinToolsQuery implements IQuery {
	static readonly type = '[Xpert Toolset] List Builtin Tools'

	constructor(public readonly provider: string,) {}
}
