import { Logger } from '@nestjs/common'
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { TestOpenAPICommand } from '../test-openapi.command'
import { ToolInvokeCommand } from '../tool-invoke.command'

@CommandHandler(TestOpenAPICommand)
export class TestOpenAPICommandHandler implements ICommandHandler<TestOpenAPICommand> {
	readonly #logger = new Logger(TestOpenAPICommandHandler.name)

	constructor(private readonly commandBus: CommandBus) {}

	public async execute(command: TestOpenAPICommand): Promise<any> {
		return this.commandBus.execute(new ToolInvokeCommand(command.tool))
	}
}
