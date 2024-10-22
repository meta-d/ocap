import { ICommand } from '@nestjs/cqrs'

export class ParserOpenAPISchemaCommand implements ICommand {
	static readonly type = '[Xpert Toolset] Parser OpenAPI Schema'

	constructor(
		public readonly schema: string
	) {}
}
