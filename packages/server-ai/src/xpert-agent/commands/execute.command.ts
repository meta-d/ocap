import { tool } from '@langchain/core/tools'
import { LangGraphRunnableConfig } from '@langchain/langgraph'
import { ChatEventTypeEnum, IXpert, IXpertAgent, IXpertAgentExecution, XpertAgentExecutionEnum } from '@metad/contracts'
import { getErrorMessage } from '@metad/server-common'
import { CommandBus, ICommand } from '@nestjs/cqrs'
import { lastValueFrom, Observable, reduce, Subscriber, tap } from 'rxjs'
import { z } from 'zod'
import { XpertAgentExecutionUpsertCommand } from '../../xpert-agent-execution/commands'

export class XpertAgentExecuteCommand implements ICommand {
	static readonly type = '[Xpert Agent] Execute'

	constructor(
		public readonly input: string,
		public readonly agentKey: string,
		public readonly xpert: IXpert,
		public readonly options: {
			// The id of root agent execution
			rootExecutionId: string
			// Langgraph thread id
			thread_id?: string
			// Use xpert's draft
			isDraft?: boolean
			// The instance of current agent execution
			execution: IXpertAgentExecution
			// The subscriber response to client
			subscriber: Subscriber<MessageEvent>
		}
	) {}
}

/**
 * Create agent of xpert as tool to execute
 *
 * @param commandBus
 * @param config
 * @returns
 */
export function createXpertAgentTool(
	commandBus: CommandBus,
	config: {
		xpert: IXpert
		agent: IXpertAgent
		options: {
			rootExecutionId: string
			isDraft: boolean
			subscriber: Subscriber<MessageEvent>
		}
	}
) {
	const { agent, xpert, options } = config
	const { subscriber } = options

	return tool(
		async (args, config: LangGraphRunnableConfig) => {
			// Record start time
			const timeStart = Date.now()

			const thread_id = crypto.randomUUID()
			const execution = await commandBus.execute(
				new XpertAgentExecutionUpsertCommand({
					xpert: { id: xpert.id } as IXpert,
					agentKey: agent.key,
					inputs: {
						input: args.input
					},
					parentId: options.rootExecutionId,
					parent_thread_id: config.configurable.thread_id,
					thread_id,
					status: XpertAgentExecutionEnum.RUNNING
				})
			)

			// Start agent execution event
			subscriber.next(
				({
					data: {
						type: ChatEventTypeEnum.EVENT,
						data: execution
					}
				}) as MessageEvent
			)

			const obs = await commandBus.execute<XpertAgentExecuteCommand, Observable<string>>(
				new XpertAgentExecuteCommand(args.input, agent.key, xpert, { ...options, thread_id, execution })
			)

			let status = XpertAgentExecutionEnum.SUCCEEDED
			let error = null
			let result = ''
			await lastValueFrom(obs.pipe(
				reduce((acc, val) => acc + val, ''),
				tap({
					next: (text: string) => {
						result = text
					},
					error: (err) => {
						status = XpertAgentExecutionEnum.FAILED
						error = getErrorMessage(err)
					},
					finalize: async () => {
						try {
							const timeEnd = Date.now()
							// Record End time
							const newExecution = await commandBus.execute(
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

							// End agent execution event
							subscriber.next(
								({
									data: {
										type: ChatEventTypeEnum.EVENT,
										data: newExecution
									}
								}) as MessageEvent
							)
						} catch(err) {
							//
						}
					}
				}
			)))

			return result
		},
		{
			name: agent.name || agent.key,
			description: agent.description,
			schema: z.object({
				input: z.string().describe('Ask me some question or give me task to complete')
			})
		}
	)
}
