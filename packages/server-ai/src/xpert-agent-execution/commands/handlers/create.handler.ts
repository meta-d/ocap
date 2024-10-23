import { IXpertAgentExecution } from '@metad/contracts'
import { Logger } from '@nestjs/common'
import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs'
import { XpertAgentExecutionService } from '../../agent-execution.service'
import { XpertAgentExecutionCreateCommand } from '../create.command'

@CommandHandler(XpertAgentExecutionCreateCommand)
export class XpertAgentExecutionCreateHandler implements ICommandHandler<XpertAgentExecutionCreateCommand> {
	readonly #logger = new Logger(XpertAgentExecutionCreateHandler.name)

	constructor(
		private readonly executionService: XpertAgentExecutionService,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	public async execute(command: XpertAgentExecutionCreateCommand): Promise<IXpertAgentExecution> {
		const entity = command.execution
		return await this.executionService.create(entity)
	}
}
