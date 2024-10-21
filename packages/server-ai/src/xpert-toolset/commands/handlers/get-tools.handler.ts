import { Logger } from '@nestjs/common'
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { In } from 'typeorm'
import { ToolsetGetToolsCommand } from '../get-tools.command'
import { XpertToolsetService } from '../../xpert-toolset.service'
import { createToolset } from '../../toolset'

@CommandHandler(ToolsetGetToolsCommand)
export class ToolsetGetToolsHandler implements ICommandHandler<ToolsetGetToolsCommand> {
	readonly #logger = new Logger(ToolsetGetToolsHandler.name)

	constructor(
		private readonly commandBus: CommandBus,
		private readonly toolsetService: XpertToolsetService
	) {}

	public async execute(command: ToolsetGetToolsCommand) {
		const ids = command.ids
		const { items: toolsets } = await this.toolsetService.findAll({
			where: {
				id: In(ids)
			}
		})

		return toolsets.map((toolset) => {
			return createToolset(toolset)
		})
	}
}
