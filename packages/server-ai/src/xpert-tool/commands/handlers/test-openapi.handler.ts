import { Logger } from '@nestjs/common'
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { TestOpenAPICommand } from '../test-openapi.command'
import { OpenAPIToolset, ToolNotSupportedError, ApiBasedToolSchemaParser } from '../../../xpert-toolset/'
import { isNil } from 'lodash'

@CommandHandler(TestOpenAPICommand)
export class TestOpenAPICommandHandler implements ICommandHandler<TestOpenAPICommand> {
	readonly #logger = new Logger(TestOpenAPICommandHandler.name)

	constructor(
		private readonly commandBus: CommandBus,
	) {}

	public async execute(command: TestOpenAPICommand): Promise<any> {
		const tool = command.tool
		const toolset = tool.toolset
		if (toolset.type === 'openapi') {
			const openapiToolset = new OpenAPIToolset({...toolset, tools: [tool] })
			const toolRuntime = openapiToolset.getTool(tool.name)
			// Parse parameters types
			const parameters = tool.schema.parameters?.reduce((acc, param) => {
				if (!isNil(tool.parameters[param.name])) {
					acc[param.name] = ApiBasedToolSchemaParser.convertPropertyValueType(param.schema, tool.parameters[param.name])
				}
				return acc
			}, {})

			return await toolRuntime.invoke(parameters)
		}

		throw new ToolNotSupportedError(`Toolset type ${toolset.type}`)
	}
}
