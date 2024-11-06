import { Logger } from '@nestjs/common'
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { parseString } from 'xml2js'
import { ParserODataSchemaCommand } from '../parser-odata-schema.command'


@CommandHandler(ParserODataSchemaCommand)
export class ParserODataSchemaHandler implements ICommandHandler<ParserODataSchemaCommand> {
	readonly #logger = new Logger(ParserODataSchemaHandler.name)

	constructor(private readonly commandBus: CommandBus) {}

	public async execute(command: ParserODataSchemaCommand): Promise<any> {
		const schema = command.schema

		const settings = {}

		const metadata = await new Promise<any>((resolve, reject) => {
			parseString(schema, (err, output) => {
				if (err) {
					reject(err)
				} else {
					// resolve(new Metadata(output, settings))
				}
			})
		})

		return {
			tools: metadata.listEntitySetNames('').map((name) => {
				const entitySet = metadata.getEntitySet(name)
				const entityType = metadata.getEntityType(entitySet.EntityType)

				return {
					name: entitySet,
					schema: {
						name: entitySet,
						method: 'get',
						path: '/',
						parameters: entityType.Properties
					}
				}
			})
		}
	}
}
