import { mapChatMessagesToStoredMessages, MessageContent } from '@langchain/core/messages'
import { IXpert, IXpertAgent } from '@metad/contracts'
import { TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Injectable, Logger } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { assign } from 'lodash'
import { catchError, EMPTY, map, Observable } from 'rxjs'
import { Repository } from 'typeorm'
import { CopilotCheckpointGetTupleQuery } from '../copilot-checkpoint/queries'
import { XpertAgentExecutionCreateCommand } from '../xpert-agent-execution/commands'
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
			new XpertAgentExecutionCreateCommand({
				xpert: { id: xpert.id } as IXpert,
				agentKey: agent.key,
				inputs: {
					input
				}
			})
		)
		const output = await this.commandBus.execute<XpertAgentExecuteCommand, Observable<MessageContent>>(
			new XpertAgentExecuteCommand(input, agent.key, xpert, { executionId: execution.id })
		)

		return new Observable((subscriber) => {
			output
				.pipe(
					map(
						(messageContent: MessageContent) =>
							({
								data: {
									type: 'message',
									data: messageContent
								}
							}) as MessageEvent
					),
					catchError((err) => {
						this.#logger.error(err)
						return EMPTY
					})
				)
				.subscribe({
					next: (event) => {
						subscriber.next(event)
					},
					error: (err) => {
						subscriber.error(err)
					},
					complete: () => {
						this.queryBus
							.execute(new CopilotCheckpointGetTupleQuery({ thread_id: execution.id, checkpoint_ns: '' }))
							.then((data) => {
								const messages = data?.checkpoint.channel_values.messages
								this.#logger.verbose(data)
								this.#logger.verbose(messages)
								subscriber.next({
									data: {
										type: 'log',
										data: {
											messages: mapChatMessagesToStoredMessages(messages)
										}
									}
								} as MessageEvent)

								subscriber.complete()
							})
							.catch((err) => subscriber.error(err))
					}
				})
		})
	}
}
