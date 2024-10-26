import { ChatEventTypeEnum, IXpert, XpertAgentExecutionEnum } from '@metad/contracts'
import { getErrorMessage } from '@metad/server-common'
import { Logger } from '@nestjs/common'
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Observable, tap } from 'rxjs'
import { XpertAgentExecutionUpsertCommand } from '../../../xpert-agent-execution/commands'
import { XpertAgentChatCommand } from '../../../xpert-agent/commands'
import { XpertService } from '../../xpert.service'
import { XpertChatCommand } from '../chat.command'

@CommandHandler(XpertChatCommand)
export class XpertChatHandler implements ICommandHandler<XpertChatCommand> {
	readonly #logger = new Logger(XpertChatHandler.name)

	constructor(
		private readonly xpertService: XpertService,
		private readonly commandBus: CommandBus
	) {}

	public async execute(command: XpertChatCommand): Promise<Observable<MessageEvent>> {
		const { xpertId, input, options } = command

		const timeStart = Date.now()

		const xpert = await this.xpertService.findOne(xpertId, { relations: ['agent'] })

		const execution = await this.commandBus.execute(
			new XpertAgentExecutionUpsertCommand({
				xpert: { id: xpert.id } as IXpert,
				inputs: {
					input
				},
				status: XpertAgentExecutionEnum.RUNNING
			})
		)

		let status = XpertAgentExecutionEnum.SUCCEEDED
		let error = null
		let result = ''

		return (
			await this.commandBus.execute<XpertAgentChatCommand, Promise<Observable<MessageEvent>>>(
				new XpertAgentChatCommand(input, xpert.agent.key, xpert, {
					isDraft: options.isDraft,
					rootExecutionId: execution.id
				})
			)
		).pipe(
			tap({
				next: (event) => {
					if (event.data.type === ChatEventTypeEnum.MESSAGE) {
						result += event.data.data
					}
				},
				error: (err) => {
					status = XpertAgentExecutionEnum.FAILED
					error = getErrorMessage(err)
				},
				finalize: async () => {
					try {
						const timeEnd = Date.now()

						// Record End time
						await this.commandBus.execute(
							new XpertAgentExecutionUpsertCommand({
								id: execution.id,
								elapsedTime: timeEnd - timeStart,
								status,
								error,
								outputs: {
									output: result
								}
							})
						)
					} catch (err) {
						//
					}
				}
			})
		)
	}
}
