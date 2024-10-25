import { tool } from '@langchain/core/tools'
import { LangGraphRunnableConfig } from '@langchain/langgraph'
import { IXpert, IXpertAgent, XpertAgentExecutionEnum } from '@metad/contracts'
import { getErrorMessage } from '@metad/server-common'
import { CommandBus, ICommand } from '@nestjs/cqrs'
import { lastValueFrom, reduce, tap } from 'rxjs'
import { z } from 'zod'
import { XpertAgentExecutionUpsertCommand } from '../../xpert-agent-execution/commands'


export class XpertAgentExecuteCommand implements ICommand {
	static readonly type = '[Xpert Agent] Execute'

	constructor(
		public readonly input: string,
		public readonly agentKey: string,
		public readonly xpert: IXpert,
		public readonly options: {
			rootExecutionId: string
			thread_id?: string
			isDraft?: boolean
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
	config: { xpert: IXpert; agent: IXpertAgent; options: {
		rootExecutionId: string;
		isDraft: boolean;
	} }
) {
	const { agent, xpert, options } = config
	// console.log(agent.key, ':', agent.description)
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
					thread_id
				})
			)
			
			const obs = await commandBus.execute(new XpertAgentExecuteCommand(args.input, agent.key, xpert, { ...options, thread_id }))

			let status = XpertAgentExecutionEnum.SUCCEEDED
			let error = null
			return await lastValueFrom(obs.pipe(
				reduce((acc, val) => acc + val, ''),
				tap({
					error: (err) => {
						status = XpertAgentExecutionEnum.FAILED
						error = getErrorMessage(err)
					},
					finalize: async () => {
						const timeEnd = Date.now()
						// Record End time
						await commandBus.execute(
							new XpertAgentExecutionUpsertCommand({
								id: execution.id,
								elapsedTime: timeEnd - timeStart,
								status,
								error
							})
						)
					}
				})
			))
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
