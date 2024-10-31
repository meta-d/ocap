import { IQuery } from '@nestjs/cqrs'

export class ListBuiltinCredentialsSchemaQuery implements IQuery {
	static readonly type = '[Xpert Toolset] List Builtin Credentials Schema'

	constructor(public readonly provider: string,) {}
}
