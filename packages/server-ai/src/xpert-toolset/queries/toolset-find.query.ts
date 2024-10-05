import { IQuery } from '@nestjs/cqrs'

export class FindXpertToolsetsQuery implements IQuery {
	static readonly type = '[Xpert Toolset] Find Many'

	constructor(public readonly ids: string[]) {}
}
