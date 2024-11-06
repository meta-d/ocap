import { XpertToolsetCategoryEnum } from '@metad/contracts'
import { Logger } from '@nestjs/common'
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { isNil } from 'lodash'
import {
	ApiBasedToolSchemaParser,
	createBuiltinToolset,
	ODataToolset,
	OpenAPIToolset,
	ToolNotSupportedError
} from '../../../xpert-toolset'
import { ToolInvokeCommand } from '../tool-invoke.command'

@CommandHandler(ToolInvokeCommand)
export class ToolInvokeHandler implements ICommandHandler<ToolInvokeCommand> {
	readonly #logger = new Logger(ToolInvokeHandler.name)

	constructor(private readonly commandBus: CommandBus) {}

	public async execute(command: ToolInvokeCommand): Promise<any> {
		// Default enabled tool for invoke
		const tool = { ...command.tool, enabled: true }
		const toolset = tool.toolset

		switch(toolset.category) {
			case XpertToolsetCategoryEnum.BUILTIN: {
				const builtinToolset = createBuiltinToolset(toolset.type, {
					...toolset,
					tools: [{ ...tool, enabled: true }]
				})
				return await builtinToolset.getTool(tool.name).invoke({
					input: tool.parameters.query
				})
			}
			case XpertToolsetCategoryEnum.API: {
				switch (toolset.type) {
					case 'openapi': {
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

					case 'odata': {
						const openapiToolset = new ODataToolset({ ...toolset, tools: [tool] })
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
				}
				break;
			}
		}

		throw new ToolNotSupportedError(`Toolset type ${toolset.type}`)
	}
}
