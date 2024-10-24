import { MessageContent } from '@langchain/core/messages'
import { IXpert, IXpertAgent, XpertAgentExecutionEnum } from '@metad/contracts'
import { TenantOrganizationAwareCrudService } from '@metad/server-core'
import { getErrorMessage } from '@metad/server-common'
import { Injectable, Logger } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { assign } from 'lodash'
import { map, Observable, tap } from 'rxjs'
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
				}
			})
		)

		const timeStart = Date.now()
		const thread_id = execution.id
		const output = await this.commandBus.execute<XpertAgentExecuteCommand, Observable<MessageContent>>(
			new XpertAgentExecuteCommand(input, agent.key, xpert, { isDraft: true, rootExecutionId: execution.id, thread_id })
		)

		let status = XpertAgentExecutionEnum.SUCCEEDED
		let error = null
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
					tap({
						error: (err) => {
							status = XpertAgentExecutionEnum.FAILED
							error = getErrorMessage(err)
						},
						finalize: async () => {
							// Record End time
							const timeEnd = Date.now()
							await this.commandBus.execute(
								new XpertAgentExecutionUpsertCommand({
									id: execution.id,
									thread_id,
									elapsedTime: timeEnd - timeStart,
									status,
									error
								})
							)

							this.commandBus.execute(new XpertAgentExecutionOneCommand(execution.id))
								.then((execution) => {
									this.#logger.verbose(execution)
									subscriber.next({
										data: {
											type: 'log',
											data: execution
										}
									} as MessageEvent)

									subscriber.complete()
								})
								.catch((err) => subscriber.error(err))
						}
					})
				)
				.subscribe({
					next: (event) => {
						subscriber.next(event)
					},
				})
		})
	}
}
