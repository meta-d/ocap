import { NotFoundException } from '@nestjs/common'
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
		// let tokenUsage = 0

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
				// tokenUsage += (token ?? 0)
				execution.tokens += (token ?? 0)
			}})
		)

		const toolsets = await this.commandBus.execute<ToolsetGetToolsCommand, BaseToolset[]>(
			new ToolsetGetToolsCommand(agent.toolsetIds)
		)
		const tools = []
		toolsets.forEach((toolset) => {
			tools.push(...toolset.getTools())
		})

		this.#logger.debug(`Use tools:\n ${tools.map((_) => _.name + ': ' + _.description)}`)

		if (agent.followers?.length) {
			this.#logger.debug(`Use sub agents:\n ${agent.followers.map((_) => _.name)}`)
			agent.followers.forEach((follower) => {
				tools.push(createXpertAgentTool(
					this.commandBus,
					{ xpert, agent: follower, options: {
						rootExecutionId: command.options.rootExecutionId,
						isDraft: command.options.isDraft,
						subscriber
					} }))
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

		const thread_id = command.options.thread_id

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
						thread_id,
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
					this.#logger.debug(err)
				},
				finalize: () => {
					// execution.tokens += tokenUsage
				}
			})
		)
	}
}