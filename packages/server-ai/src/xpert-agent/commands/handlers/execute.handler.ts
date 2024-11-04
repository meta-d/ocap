import { NotFoundException } from '@nestjs/common'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { AIMessageChunk, HumanMessage, MessageContent, SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { StateGraphArgs } from '@langchain/langgraph'
import { ChatEventTypeEnum, ICopilot, IXpertAgent } from '@metad/contracts'
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
import { XpertCopilotNotFoundException } from '../../../core/errors'



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
		const { input, agentKey, xpert, options } = command
		const { execution, subscriber } = options
		const tenantId = RequestContext.currentTenantId()
		const organizationId = RequestContext.getOrganizationId()
		const user = RequestContext.currentUser()
		const abortController = new AbortController()

		const agent = await this.queryBus.execute<GetXpertAgentQuery, IXpertAgent>(new GetXpertAgentQuery(xpert.id, agentKey, command.options?.isDraft))
		if (!agent) {
			throw new NotFoundException(`Xpert agent not found for '${xpert.name}' and key ${agentKey} draft is ${command.options?.isDraft}`)
		}

		const team = agent.team
		let copilot: ICopilot = null
		const copilotId = agent.copilotModel?.copilotId ?? team.copilotModel?.copilotId
		const copilotModel = agent.copilotModel ?? team.copilotModel
		if (copilotId) {
			copilot = await this.queryBus.execute(new CopilotGetOneQuery(copilotId))
		} else {
			throw new XpertCopilotNotFoundException(`Xpert copilot not found for '${xpert.name}'`)
		}

		const chatModel = await this.queryBus.execute<AIModelGetOneQuery, BaseChatModel>(
			new AIModelGetOneQuery(copilot, copilotModel, {abortController, tokenCallback: (token) => {
				execution.tokens += (token ?? 0)
			}})
		)

		const toolsets = await this.commandBus.execute<ToolsetGetToolsCommand, BaseToolset[]>(
			new ToolsetGetToolsCommand(agent.toolsetIds)
		)
		const tools = []
		toolsets.forEach((toolset) => tools.push(...toolset.getTools()))

		this.#logger.debug(`Use tools:\n ${tools.map((_) => _.name + ': ' + _.description)}`)

		if (agent.followers?.length) {
			this.#logger.debug(`Use sub agents:\n ${agent.followers.map((_) => _.name)}`)
			agent.followers.forEach((follower) => {
				tools.push(createXpertAgentTool(
					this.commandBus,
					{
						xpert,
						agent: follower,
						options: {
							rootExecutionId: command.options.rootExecutionId,
							isDraft: command.options.isDraft,
							subscriber
						}
					}
				))
			})
		}

		if (agent.collaborators?.length) {
			this.#logger.debug(`Use xpert collaborators:\n ${agent.collaborators.map((_) => _.name)}`)
			for await (const collaborator of agent.collaborators) {
				const agent = await this.queryBus.execute<GetXpertAgentQuery, IXpertAgent>(new GetXpertAgentQuery(collaborator.id,))
				tools.push(createXpertAgentTool(
					this.commandBus,
					{
						xpert: collaborator,
						agent,
						options: {
							rootExecutionId: command.options.rootExecutionId,
							isDraft: false,
							subscriber
						} }))
			}
		}

		// Custom parameters
		agent.parameters?.forEach((parameter) => {
			chatAgentState[parameter.name] = {
				value: (x: any, y: any) => y ?? x,
				default: () => ''
			}
		})

		const thread_id = command.options.thread_id
		const graph = createReactAgent({
			tags: [thread_id],
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

		this.#logger.debug(`Start chat with xpert '${xpert.name}' & agent '${agent.title}'`)

		let prevEvent = ''
		return from(
			graph.streamEvents(
				{
					...input,
					messages: [new HumanMessage(input.input)]
				},
				{
					version: 'v2',
					configurable: {
						thread_id,
						checkpoint_ns: '',
						tenantId: tenantId,
						organizationId: organizationId,
						userId: user.id
					},
					recursionLimit: AgentRecursionLimit,
					signal: abortController.signal
					// debug: true
				},
			)
		).pipe(
			map(({ event, tags, data, ...rest }: any) => {
				if (Logger.isLevelEnabled('debug')) {
					if (event === 'on_chat_model_stream') {
						if (prevEvent === 'on_chat_model_stream') {
							process.stdout.write('.')
						} else {
							this.#logger.debug('on_chat_model_stream')
						}
					} else {
						if (prevEvent === 'on_chat_model_stream') {
							process.stdout.write('\n')
						}
						this.#logger.debug(event)
					}
				} else {
					this.#logger.verbose(event)
				}

				prevEvent = event
				switch (event) {
					case 'on_chat_model_stream': {
						// Only returns the stream events content of the current react agent (filter by tag: thread_id), not events of agent in tool call.
						if (tags.includes(thread_id)) {
							const msg = data.chunk as AIMessageChunk
							if (!msg.tool_call_chunks?.length) {
								if (msg.content) {
									return msg.content
								}
							}
						}
						break
					}
					case 'on_tool_start': {
						this.#logger.verbose(data, rest)
						subscriber.next({
							data: {
								type: ChatEventTypeEnum.EVENT,
								event: 'on_tool_start',
								data: {
									data,
									...rest,
								}
							}
						} as MessageEvent)
						break
					}
					case 'on_tool_end': {
						this.#logger.verbose(data, rest)
						subscriber.next({
							data: {
								type: ChatEventTypeEnum.EVENT,
								event: 'on_tool_end',
								data: {
									data,
									...rest,
								}
							}
						} as MessageEvent)
						break
					}
				}
				return null
			}),
			filter((content) => !isNil(content)),
			tap({
				complete: () => {
					this.#logger.debug(`End chat.`)
				},
				error: (err) => {
					this.#logger.debug(err)
				},
				finalize: () => {
					//
				}
			})
		)
	}
}
