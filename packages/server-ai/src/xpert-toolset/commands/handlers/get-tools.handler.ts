import { Tool } from '@langchain/core/tools'
import { Logger } from '@nestjs/common'
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { In } from 'typeorm'
import { OpenAPIToolset } from '../../provider/openapi-toolset'
import { BaseToolset, createToolset } from '../../toolset'
import { XpertToolsetService } from '../../xpert-toolset.service'
import { ToolsetGetToolsCommand } from '../get-tools.command'

@CommandHandler(ToolsetGetToolsCommand)
export class ToolsetGetToolsHandler implements ICommandHandler<ToolsetGetToolsCommand> {
	readonly #logger = new Logger(ToolsetGetToolsHandler.name)

	constructor(
		private readonly commandBus: CommandBus,
		private readonly toolsetService: XpertToolsetService
	) {}

	public async execute(command: ToolsetGetToolsCommand): Promise<BaseToolset<Tool>[]> {
		const ids = command.ids
		const { items: toolsets } = await this.toolsetService.findAll({
			where: {
				id: In(ids)
			},
			relations: ['tools']
		})

		return toolsets.map((toolset) => {
			if (toolset.type === 'openapi') {
				return new OpenAPIToolset(toolset)
			}
			return createToolset(toolset) as BaseToolset<Tool>
		})
	}
}