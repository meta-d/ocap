import { ICommand } from '@nestjs/cqrs'

export class ParserODataSchemaCommand implements ICommand {
	static readonly type = '[Xpert Toolset] Parser OData Schema'

	constructor(
		public readonly schema: string
	) {}
}
