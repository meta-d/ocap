import { DuckDuckGoSearch } from '@langchain/community/tools/duckduckgo_search'
import { TavilySearchResults } from '@langchain/community/tools/tavily_search'
import { WikipediaQueryRun } from '@langchain/community/tools/wikipedia_query_run'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { AIMessageChunk, HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { tool } from '@langchain/core/tools'
import { CompiledStateGraph, START } from '@langchain/langgraph'
import {
	AiProviderRole,
	ChatGatewayEvent,
	ChatGatewayMessage,
	CopilotBaseMessage,
	CopilotChatMessage,
	CopilotMessageGroup,
	IChatConversation,
	ICopilot,
	ICopilotToolset,
	IUser
} from '@metad/contracts'
import { AgentRecursionLimit } from '@metad/copilot'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { jsonSchemaToZod } from 'json-schema-to-zod'
import { formatDocumentsAsString } from 'langchain/util/document'
import { catchError, concat, filter, from, fromEvent, map, Observable, of, tap } from 'rxjs'
import { z } from 'zod'
import { ChatConversationUpdateCommand } from '../chat-conversation'
import { createLLM, createReactAgent } from '../copilot'
import { CopilotCheckpointSaver } from '../copilot-checkpoint'
import { CopilotTokenRecordCommand } from '../copilot-user/commands'
import { KnowledgeSearchQuery } from '../knowledgebase/queries'
import { ChatService } from './chat.service'
import { ChatAgentState, chatAgentState } from './types'
import { Logger } from '@nestjs/common'


export class ChatConversationAgent {
	private logger = new Logger(ChatConversationAgent.name)
	private copilot: ICopilot = null
	public graph: CompiledStateGraph<ChatAgentState, Partial<ChatAgentState>, typeof START | 'agent' | 'tools'>
	get id() {
		return this.conversation.id
	}
	get tenantId() {
		return this.user.tenantId
	}

	private message: CopilotMessageGroup = null
	private abortController: AbortController
	constructor(
		public conversation: IChatConversation,
		public readonly organizationId: string,
		private readonly user: IUser,
		private readonly copilotCheckpointSaver: CopilotCheckpointSaver,
		private readonly chatService: ChatService,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {
		this.copilot = this.chatService.findCopilot(this.tenantId, organizationId, AiProviderRole.Secondary)
	}

	createLLM(copilot: ICopilot) {
		return createLLM<BaseChatModel>(copilot, {}, (input) => {
			this.commandBus.execute(
				new CopilotTokenRecordCommand({
					...input,
					tenantId: this.tenantId,
					organizationId: this.organizationId,
					userId: this.user.id,
					copilot: copilot
				})
			)
		})
	}

	createAgentGraph(toolsets: ICopilotToolset[]) {
		const llm = this.createLLM(this.copilot)
		if (!llm) {
			throw new Error(`Can't create chatModel for provider '${this.copilot.provider}'`)
		}

		const tools = []
		toolsets.forEach((toolset) => {
			switch (toolset.name) {
				case 'TavilySearch': {
					const tavilySearchTool = new TavilySearchResults({
						apiKey: '',
						maxResults: 2
					})
					tools.push(tavilySearchTool)
					break
				}
				case 'Wikipedia': {
					const wikiTool = new WikipediaQueryRun({
						topKResults: 3,
						maxDocContentLength: 4000
					})
					tools.push(wikiTool)
					break
				}
				case 'DuckDuckGo': {
					const duckTool = new DuckDuckGoSearch({ maxResults: 1 })
					tools.push(duckTool)
					break
				}
				default: {
					toolset.tools.forEach((item) => {
						switch (item.type) {
							case 'command': {
								let zodSchema: z.AnyZodObject = null
								try {
									zodSchema = eval(jsonSchemaToZod(JSON.parse(item.schema), { module: 'cjs' }))
								} catch (err) {
									throw new Error(`Invalid input schema for tool: ${item.name}`)
								}
								// Copilot
								let chatModel = llm
								if (item.providerRole || toolset.providerRole) {
									const copilot = this.chatService.findCopilot(this.tenantId, this.organizationId, item.providerRole || toolset.providerRole)
									chatModel = this.createLLM(copilot)
								}

								tools.push(
									tool(
										async (args, config) => {
											return await this.chatService.executeCommand(item.name, args, config, {
												tenantId: this.tenantId,
												organizationId: this.organizationId,
												user: this.user,
												chatModel
											})
										},
										{
											name: item.name,
											description: item.description,
											schema: zodSchema
										}
									)
								)
								break
							}
						}
					})
				}
			}
		})

		this.graph = createReactAgent({
			state: chatAgentState,
			llm,
			checkpointSaver: this.copilotCheckpointSaver,
			// interruptBefore,
			// interruptAfter,
			tools: [...tools],
			messageModifier: async (state) => {
				const systemTemplate = `{{role}}
{{language}}
References documents:
{{context}}
`
				const system = await SystemMessagePromptTemplate.fromTemplate(systemTemplate, {
					templateFormat: 'mustache'
				}).format({ ...state })
				return [new SystemMessage(system), ...state.messages]
			}
		})

		return this
	}

	streamGraphEvents(input: string, answerId: string) {
		let aiContent = ''
		const eventStack: string[] = []
		let toolName = ''
		let stepMessage = null
		return new Observable((subscriber) => {
			from(
				this.graph.streamEvents(
					{
						input,
						messages: [new HumanMessage(input)]
					},
					{
						version: 'v2',
						configurable: {
							thread_id: this.id,
							checkpoint_ns: '',
							tenantId: this.tenantId,
							organizationId: this.organizationId,
							subscriber
						},
						recursionLimit: AgentRecursionLimit,
						signal: this.abortController.signal
						// debug: true
					}
				)
			).pipe(
				map(({ event, data, ...rest }: any) => {
					console.log(event)
					switch (event) {
						case 'on_chain_start': {
							eventStack.push(event)
							break
						}
						case 'on_chat_model_start': {
							eventStack.push(event)
							break
						}
						case 'on_chain_end': {
							const _event = eventStack.pop()
							if (_event === 'on_tool_start') {
								eventStack.pop()
								if (stepMessage) {
									stepMessage.status = 'done'
								}
								return {
									event: ChatGatewayEvent.ToolEnd,
									data: {
										name: toolName
									}
								}
							}
							if (_event !== 'on_chain_start') {
								eventStack.pop()
							}
							if (!eventStack.length) {
								this.updateMessage({ ...this.message, status: 'done' })
								return {
									event: ChatGatewayEvent.ChainEnd,
									data: {
										id: answerId
									}
								}
							}
							break
						}
						case 'on_chat_model_end': {
							const _event = eventStack.pop()
							if (_event !== 'on_chat_model_start') {
								eventStack.pop()
							}
							if (aiContent) {
								this.message.content = aiContent
							}
							return null
						}
						case 'on_chat_model_stream': {
							const msg = data.chunk as AIMessageChunk
							if (!msg.tool_call_chunks?.length) {
								if (msg.content) {
									aiContent += msg.content
									return {
										event: ChatGatewayEvent.MessageStream,
										data: {
											conversationId: this.id,
											id: answerId,
											content: msg.content
										}
									}
								}
							}
							break
						}
						case 'on_tool_start': {
							eventStack.push(event)
							toolName = rest.name
							stepMessage = {
								id: rest.name,
								name: rest.name,
								role: 'tool',
								status: 'thinking'
							}
							this.addStep(stepMessage)
							return {
								event: ChatGatewayEvent.ToolStart,
								data: {
									name: rest.name
								}
							}
						}
						case 'on_tool_end': {
							const _event = eventStack.pop()
							if (_event !== 'on_tool_start') {
								eventStack.pop()
							}
							if (stepMessage) {
								stepMessage.status = 'done'
							}
							return {
								event: ChatGatewayEvent.ToolEnd,
								data: {
									name: rest.name,
									output: (<ToolMessage>data.output).content
								}
							} as ChatGatewayMessage
						}
					}
					return null
				}),
			).subscribe(subscriber)
		}).pipe(
			filter((data) => data != null),
			tap((event: ChatGatewayMessage) => {
				if (event?.event === ChatGatewayEvent.Message) {
					this.addStep(event.data)
				}
			}),
			catchError((err) => {
				console.error(err)
				return of({
					event: ChatGatewayEvent.ChainAborted,
					data: {
						conversationId: this.conversation.id,
						id: answerId
					}
				})
			})
		)
	}

	knowledgeSearch(content: string, answerId: string) {
		return new Observable((subscriber) => {
			let completed = false
			if (!this.conversation.options?.knowledgebases?.length) {
				completed = true
				subscriber.complete()
			}

			const stepMessage: CopilotChatMessage = {
				id: 'documents',
				role: 'system',
				content: '',
				status: 'thinking'
			}
			subscriber.next({
				event: ChatGatewayEvent.StepStart,
				data: stepMessage
			})
			// Search knowledgebases
			this.queryBus
				.execute(
					new KnowledgeSearchQuery({
						tenantId: this.tenantId,
						organizationId: this.organizationId,
						k: 5,
						score: 0.5,
						knowledgebases: this.conversation.options?.knowledgebases,
						query: content
					})
				)
				.then((items) => {
					if (!subscriber.closed) {
						const context = formatDocumentsAsString(items.map(({ doc }) => doc))
						this.updateState({ context })

						stepMessage.status = 'done'
						stepMessage.content = `Got ${items.length} document chunks!`
						this.addStep({ ...stepMessage, status: 'done' })
						completed = true
						subscriber.next({
							event: ChatGatewayEvent.StepEnd,
							data: { ...stepMessage, status: 'done' }
						})
						subscriber.complete()
					}
				})

			return () => {
				if (!completed) {
					this.addStep({ ...stepMessage, status: 'aborted' })
				}
			}
		})
	}

	chat(input: string, answerId: string) {
		if (this.abortController) {
			this.cancel()
		}
		this.abortController = new AbortController()
		const abortSignal$ = fromEvent(this.abortController.signal, 'abort')
		return concat(this.knowledgeSearch(input, answerId), this.streamGraphEvents(input, answerId)).pipe(
			(source) =>
				new Observable((subscriber) => {
					abortSignal$.subscribe(() => {
						subscriber.next({
							event: ChatGatewayEvent.ChainAborted,
							data: {
								conversationId: this.conversation.id,
								id: answerId
							}
						})
						subscriber.unsubscribe()
						this.abortMessage()
					})
					!subscriber.closed && source.subscribe(subscriber)
				})
		)
	}

	updateState(state: Partial<ChatAgentState>) {
		this.graph.updateState(
			{
				configurable: {
					thread_id: this.id,
					checkpoint_ns: '',
					checkpoint_id: '',
					tenantId: this.tenantId,
					organizationId: this.organizationId,
				}
			},
			state
		)
	}

	newMessage(answerId: string) {
		this.message = { id: answerId, messages: [], role: 'assistant', content: '' } as CopilotMessageGroup
	}

	addStep(step: CopilotChatMessage) {
		this.message.messages.push(step)
	}

	async abortMessage() {
		try {
			await this.updateMessage({
				...this.message,
				status: 'aborted',
				messages: this.message.messages.map((m) => (m.status === 'thinking' ? { ...m, status: 'aborted' } : m))
			} as CopilotMessageGroup)
			this.logger.debug(`Conversation '${this.id}' has been aborted`)
		} catch (err) {
			console.log('error', err)
		}
	}

	async updateMessage(message: CopilotBaseMessage) {
		// Record conversation messages
		this.conversation = await this.commandBus.execute(
			new ChatConversationUpdateCommand({
				id: this.id,
				entity: {
					title: this.conversation.title || message.content,
					messages: [...(this.conversation.messages ?? []), message]
				}
			})
		)
	}

	/**
	 * Cancel the currently existing Graph execution task
	 */
	cancel() {
		try {
			this.abortController?.abort(`Abort by user`)
		} catch (err) {
			//
		}

		this.abortController = null
	}
}
