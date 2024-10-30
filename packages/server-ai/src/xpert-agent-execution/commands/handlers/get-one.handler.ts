import { mapChatMessagesToStoredMessages } from '@langchain/core/messages'
import { IXpertAgentExecution } from '@metad/contracts'
import { Logger } from '@nestjs/common'
import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs'
import { sortBy } from 'lodash'
import { CopilotCheckpointGetTupleQuery } from '../../../copilot-checkpoint/queries'
import { XpertAgentExecutionService } from '../../agent-execution.service'
import { XpertAgentExecutionOne1Command } from '../get-one.command'


@CommandHandler(XpertAgentExecutionOne1Command)
export class XpertAgentExecutionOneHandler implements ICommandHandler<XpertAgentExecutionOne1Command> {
	readonly #logger = new Logger(XpertAgentExecutionOneHandler.name)

	constructor(
		private readonly executionService: XpertAgentExecutionService,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	public async execute(command: XpertAgentExecutionOne1Command): Promise<IXpertAgentExecution> {
		const id = command.id
		const execution = await this.executionService.findOne(id, { relations: ['subExecutions'] })

		const subExecutions = sortBy(execution.subExecutions, 'createdAt')

		return {
			...(await this.expandExecutionLatestCheckpoint(execution)),
			subExecutions: await Promise.all(subExecutions.map((item) => this.expandExecutionLatestCheckpoint(item)))
		}
	}

	async expandExecutionLatestCheckpoint(execution: IXpertAgentExecution) {
		if (!execution.thread_id) {
			return execution
		}
		const tuple = await this.queryBus.execute(
			new CopilotCheckpointGetTupleQuery({ thread_id: execution.thread_id, checkpoint_ns: '' })
		)
		const messages = tuple?.checkpoint?.channel_values?.messages
		return {
			...execution,
			messages: messages ? mapChatMessagesToStoredMessages(messages) : null
		}
	}
}
