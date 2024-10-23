import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { AIMessageChunk, HumanMessage, MessageContent, SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { StateGraphArgs } from '@langchain/langgraph'
import { ICopilot, IXpertAgent } from '@metad/contracts'
import { AgentRecursionLimit, isNil } from '@metad/copilot'
import { RequestContext } from '@metad/server-core'
import { Logger } from '@nestjs/common'
import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs'
import { filter, from, map, Observable, tap } from 'rxjs'
import { AIModelGetOneQuery } from '../../../ai-model'
import { AgentState, CopilotGetOneQuery, createCopilotAgentState, createReactAgent } from '../../../copilot'
import { CopilotCheckpointSaver } from '../../../copilot-checkpoint'
import { BaseToolset, ToolsetGetToolsCommand } from '../../../xpert-toolset'
import { XpertAgentService } from '../../xpert-agent.service'
import { createXpertAgentTool, XpertAgentExecuteCommand } from '../execute.command'
import { GetXpertAgentQuery } from '../../../xpert/queries'



export type ChatAgentState = AgentState
export const chatAgentState: StateGraphArgs<ChatAgentState>['channels'] = {
	...createCopilotAgentState()
}

@CommandHandler(XpertAgentExecuteCommand)
export class XpertAgentExecuteHandler implements ICommandHandler<XpertAgentExecuteCommand> {
	readonly #logger = new Logger(XpertAgentExecuteHandler.name)

	constructor(
		private readonly agentService: XpertAgentService,
		private readonly copilotCheckpointSaver: CopilotCheckpointSaver,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	public async execute(command: XpertAgentExecuteCommand): Promise<Observable<MessageContent>> {
		const { input, agentKey, xpert } = command
		const tenantId = RequestContext.currentTenantId()
		const organizationId = RequestContext.getOrganizationId()
		const user = RequestContext.currentUser()

		const agent = await this.queryBus.execute<GetXpertAgentQuery, IXpertAgent>(new GetXpertAgentQuery(xpert.id, agentKey,))

		let copilot: ICopilot = null
		const copilotId = agent.copilotModel?.copilotId ?? xpert.copilotModel?.copilotId
		const copilotModel = agent.copilotModel ?? xpert.copilotModel
		if (copilotId) {
			copilot = await this.queryBus.execute(new CopilotGetOneQuery(copilotId))
		}

		const chatModel = await this.queryBus.execute<AIModelGetOneQuery, BaseChatModel>(
			new AIModelGetOneQuery(copilot, copilotModel)
		)

		const toolsets = await this.commandBus.execute<ToolsetGetToolsCommand, BaseToolset[]>(
			new ToolsetGetToolsCommand(agent.toolsetIds)
		)
		const tools = []
		toolsets.forEach((toolset) => {
			tools.push(...toolset.getTools())
		})

		this.#logger.debug(`Use tools:`, tools.map((_) => _.name + ': ' + _.description))

		if (agent.followers?.length) {
			agent.followers.forEach((follower) => {
				tools.push(createXpertAgentTool(
					this.commandBus,
					{ xpert, agent: follower, options: {executionId: command.options.executionId + agentKey } }))
			})
		}

		const graph = createReactAgent({
			state: chatAgentState,
			llm: chatModel,
			checkpointSaver: this.copilotCheckpointSaver,
			tools: [...tools],
			messageModifier: async (state) => {
				const systemTemplate = `{{role}}
{{language}}
References documents:
{{context}}
${agent.prompt}
`
				const system = await SystemMessagePromptTemplate.fromTemplate(systemTemplate, {
					templateFormat: 'mustache'
				}).format({ ...state })
				return [new SystemMessage(system), ...state.messages]
			}
		})

		const threadId = command.options.executionId
		const abortController = new AbortController()

		this.#logger.debug(`Start chat with xpert '${xpert.name}' & agent '${agent.title}'`)
		let prevEvent = ''
		return from(
			graph.streamEvents(
				{
					input,
					messages: [new HumanMessage(input)]
				},
				{
					version: 'v2',
					configurable: {
						thread_id: threadId,
						checkpoint_ns: '',
						tenantId: tenantId,
						organizationId: organizationId,
						userId: user.id
					},
					recursionLimit: AgentRecursionLimit,
					signal: abortController.signal
					// debug: true
				}
			)
		).pipe(
			map(({ event, data, ...rest }: any) => {
				// this.#logger.verbose(event, data, rest)
				if (Logger.isLevelEnabled('verbose')) {
					if (event === 'on_chat_model_stream') {
						if (prevEvent === 'on_chat_model_stream') {
							process.stdout.write('.')
						} else {
							this.#logger.verbose('on_chat_model_stream')
						}
					} else {
						if (prevEvent === 'on_chat_model_stream') {
							process.stdout.write('\n')
						}
						this.#logger.verbose(event)
					}
				}
				prevEvent = event
				switch (event) {
					case 'on_chat_model_stream': {
						const msg = data.chunk as AIMessageChunk
						if (!msg.tool_call_chunks?.length) {
							if (msg.content) {
								return msg.content
							}
						}
						break
					}
					default: {
						return null
					}
				}
			}),
			filter((content) => !isNil(content)),
			tap({
				complete: () => {
					this.#logger.debug(`End chat.`)
				},
				error: (err) => {
					console.log(err)
					this.#logger.debug(err)
				}
			})
		)
	}

}
