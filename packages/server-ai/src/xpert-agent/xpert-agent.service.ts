import { MessageContent } from '@langchain/core/messages'
import { IXpert, IXpertAgent, XpertAgentExecutionEnum } from '@metad/contracts'
import { getErrorMessage } from '@metad/server-common'
import { TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Injectable, Logger } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { assign } from 'lodash'
import { from, map, Observable, switchMap, tap } from 'rxjs'
import { Repository } from 'typeorm'
import { XpertAgentExecutionOneCommand, XpertAgentExecutionUpsertCommand } from '../xpert-agent-execution/commands'
import { XpertAgentExecuteCommand } from './commands'
import { XpertAgent } from './xpert-agent.entity'

@Injectable()
export class XpertAgentService extends TenantOrganizationAwareCrudService<XpertAgent> {
	readonly #logger = new Logger(XpertAgentService.name)

	constructor(
		@InjectRepository(XpertAgent)
		repository: Repository<XpertAgent>,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {
		super(repository)
	}

	async update(id: string, entity: Partial<XpertAgent>) {
		const _entity = await super.findOne(id)
		assign(_entity, entity)
		return await this.repository.save(_entity)
	}

	/**
	 * @deprecated use XpertAgentChatCommand
	 */
	async executeAgent({
		input,
		agent,
		xpert
	}: {
		input: string
		agent: IXpertAgent
		xpert: IXpert
	}): Promise<Observable<MessageEvent>> {
		const execution = await this.commandBus.execute(
			new XpertAgentExecutionUpsertCommand({
				xpert: { id: xpert.id } as IXpert,
				agentKey: agent.key,
				inputs: {
					input
				},
				status: XpertAgentExecutionEnum.RUNNING
			})
		)

		const timeStart = Date.now()
		const thread_id = execution.id

		return new Observable((subscriber) => {
			// Start execution event
			subscriber.next({
				data: {
					type: 'log',
					data: execution
				}
			} as MessageEvent)

			let status = XpertAgentExecutionEnum.SUCCEEDED
			let error = null
			let result = ''
			from(
				this.commandBus.execute<XpertAgentExecuteCommand, Observable<MessageContent>>(
					new XpertAgentExecuteCommand(input, agent.key, xpert, {
						isDraft: true,
						rootExecutionId: execution.id,
						thread_id,
						execution,
						subscriber
					})
				)
			).pipe(
				switchMap((output) => output),
					map((messageContent: MessageContent) => {
						result += messageContent
						return {
							data: {
								type: 'message',
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
										elapsedTime: timeEnd - timeStart,
										status,
										error,
										tokens: execution.tokens,
										thread_id,
										outputs: {
											output: result
										}
									})
								)

								const fullExecution = await this.commandBus.execute(
									new XpertAgentExecutionOneCommand(execution.id)
								)

								this.#logger.verbose(fullExecution)

								subscriber.next({
									data: {
										type: 'log',
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
					}
				})
		})
	}
}
