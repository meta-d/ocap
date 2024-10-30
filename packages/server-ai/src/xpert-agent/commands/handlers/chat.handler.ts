import { MessageContent } from '@langchain/core/messages'
import { ChatEventTypeEnum, IXpert, XpertAgentExecutionEnum } from '@metad/contracts'
import { getErrorMessage } from '@metad/server-common'
import { Logger } from '@nestjs/common'
import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs'
import { from, map, Observable, switchMap, tap } from 'rxjs'
import {
	XpertAgentExecutionUpsertCommand
} from '../../../xpert-agent-execution/commands'
import { XpertAgentChatCommand } from '../chat.command'
import { XpertAgentExecuteCommand } from '../execute.command'
import { XpertAgentExecutionOneQuery } from '../../../xpert-agent-execution/queries'

@CommandHandler(XpertAgentChatCommand)
export class XpertAgentChatHandler implements ICommandHandler<XpertAgentChatCommand> {
	readonly #logger = new Logger(XpertAgentChatHandler.name)

	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	public async execute(command: XpertAgentChatCommand): Promise<Observable<MessageEvent>> {
		const { input, xpert, agentKey, options } = command
		let { execution } = options
		execution = await this.commandBus.execute(
			new XpertAgentExecutionUpsertCommand({
				id: execution?.id,
				xpert: { id: xpert.id } as IXpert,
				agentKey,
				inputs: input,
				status: XpertAgentExecutionEnum.RUNNING,
				title: input.input
			})
		)

		const timeStart = Date.now()
		const thread_id = execution.id

		return new Observable((subscriber) => {
			// Start execution event
			subscriber.next({
				data: {
					type: ChatEventTypeEnum.LOG,
					data: execution
				}
			} as MessageEvent)

			let status = XpertAgentExecutionEnum.SUCCEEDED
			let error = null
			let result = ''
			from(
				this.commandBus.execute<XpertAgentExecuteCommand, Observable<MessageContent>>(
					new XpertAgentExecuteCommand(input, agentKey, xpert, {
						isDraft: true,
						rootExecutionId: execution.id,
						thread_id,
						execution,
						subscriber
					})
				)
			)
				.pipe(
					switchMap((output) => output),
					map((messageContent: MessageContent) => {
						result += messageContent
						return {
							data: {
								type: ChatEventTypeEnum.MESSAGE,
								data: messageContent
							}
						} as MessageEvent
					}),
					tap({
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
										elapsedTime: Number(execution.elapsedTime ?? 0) + (timeEnd - timeStart),
										status,
										error,
										tokens: execution.tokens,
										thread_id,
										outputs: {
											output: result
										}
									})
								)

								const fullExecution = await this.queryBus.execute(
									new XpertAgentExecutionOneQuery(execution.id)
								)

								this.#logger.verbose(fullExecution)

								subscriber.next({
									data: {
										type: ChatEventTypeEnum.LOG,
										data: fullExecution
									}
								} as MessageEvent)

								subscriber.complete()
							} catch (err) {
								subscriber.error(err)
							}
						}
					})
				)
				.subscribe({
					next: (event) => {
						subscriber.next(event)
					},
					error: () => {
						/**
						 * The empty error method is used to catch exceptions and cannot be removed.
						 * The error handling logic is placed in the `finalize` method
						 */
					}
				})
		})
	}
}
