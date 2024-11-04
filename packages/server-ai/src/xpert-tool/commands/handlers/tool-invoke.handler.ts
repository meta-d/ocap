import { XpertToolsetCategoryEnum } from '@metad/contracts'
import { Logger } from '@nestjs/common'
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { isNil } from 'lodash'
import {
	ApiBasedToolSchemaParser,
	createBuiltinToolset,
	OpenAPIToolset,
	ToolNotSupportedError
} from '../../../xpert-toolset'
import { ToolInvokeCommand } from '../tool-invoke.command'

@CommandHandler(ToolInvokeCommand)
export class ToolInvokeHandler implements ICommandHandler<ToolInvokeCommand> {
	readonly #logger = new Logger(ToolInvokeHandler.name)

	constructor(private readonly commandBus: CommandBus) {}

	public async execute(command: ToolInvokeCommand): Promise<any> {
		const tool = command.tool
		const toolset = tool.toolset
		if (toolset.type === 'openapi') {
			const openapiToolset = new OpenAPIToolset({ ...toolset, tools: [tool] })
			const toolRuntime = openapiToolset.getTool(tool.name)
			// Parse parameters types
			const parameters = tool.schema.parameters?.reduce((acc, param) => {
				if (!isNil(tool.parameters[param.name])) {
					acc[param.name] = ApiBasedToolSchemaParser.convertPropertyValueType(
						param.schema,
						tool.parameters[param.name]
					)
				}
				return acc
			}, {})

			return await toolRuntime.invoke(parameters)
		}

		if (toolset.category === XpertToolsetCategoryEnum.BUILTIN) {
			const builtinToolset = createBuiltinToolset(toolset.type, {...toolset, tools: [{...tool, enabled: true}]})
			return await builtinToolset.getTool(tool.name).invoke({
				input: tool.parameters.query
			})
		}

		throw new ToolNotSupportedError(`Toolset type ${toolset.type}`)
	}
}
