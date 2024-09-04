import { DuckDuckGoSearch } from '@langchain/community/tools/duckduckgo_search'
import { TavilySearchResults } from '@langchain/community/tools/tavily_search'
import { WikipediaQueryRun } from '@langchain/community/tools/wikipedia_query_run'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { AIMessageChunk, HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { CompiledStateGraph, START } from '@langchain/langgraph'
import {
	ChatGatewayEvent,
	ChatGatewayMessage,
	CopilotChatMessage,
	CopilotMessageGroup,
	IChatConversation,
	ICopilotToolset,
	IUser
} from '@metad/contracts'
import { AgentRecursionLimit } from '@metad/copilot'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { from, map } from 'rxjs'
import { ChatConversationUpdateCommand } from '../chat-conversation'
import { Copilot, createLLM, createReactAgent } from '../copilot'
import { CopilotCheckpointSaver } from '../copilot-checkpoint'
import { CopilotTokenRecordCommand } from '../copilot-user/commands'
import { ChatAgentState, chatAgentState } from './types'

export class ChatConversationAgent {
	public graph: CompiledStateGraph<ChatAgentState, Partial<ChatAgentState>, typeof START | 'agent' | 'tools'>
	get id() {
		return this.conversation.id
	}

	private message: CopilotMessageGroup = null
	constructor(
		public conversation: IChatConversation,
		public readonly organizationId: string,
		private readonly user: IUser,
		private readonly copilot: Copilot,
		private readonly copilotCheckpointSaver: CopilotCheckpointSaver,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	createAgentGraph(toolsets: ICopilotToolset[]) {
		const llm = createLLM<BaseChatModel>(this.copilot, {}, (input) => {
			this.commandBus.execute(
				new CopilotTokenRecordCommand({
					...input,
					tenantId: this.copilot.tenantId,
					userId: this.user.id,
					copilot: this.copilot
				})
			)
		})

		const tools = []
		if (toolsets.some((item) => item.name === 'TavilySearch')) {
			const tavilySearchTool = new TavilySearchResults({
				apiKey: '',
				maxResults: 2
			})
			tools.push(tavilySearchTool)
		}
		if (toolsets.some((item) => item.name === 'Wikipedia')) {
			const wikiTool = new WikipediaQueryRun({
				topKResults: 3,
				maxDocContentLength: 4000
			})
			tools.push(wikiTool)
		}
		if (toolsets.some((item) => item.name === 'DuckDuckGo')) {
			const duckTool = new DuckDuckGoSearch({ maxResults: 1 })
			tools.push(duckTool)
		}

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

	chat(input: string, answerId: string) {
		let aiContent = ''
		const eventStack: string[] = []
		let toolName = ''
		// const message = { id: answerId, messages: [], role: 'assistant', content: '' } as CopilotMessageGroup
		return from(
			this.graph.streamEvents(
				{
					input,
					messages: [new HumanMessage(input)]
				},
				{
					version: 'v2',
					configurable: {
						thread_id: this.id,
						thread_ns: ''
					},
					recursionLimit: AgentRecursionLimit
					// debug: true
				}
			)
		).pipe(
			// tap(({ event }: any) => console.log(`streamEvents event type of graph:`, event)),
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
							this.message.messages.push({
								id: toolName,
								name: toolName,
								role: 'tool',
								status: 'done'
							})
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
							this.updateMessage({...this.message, status: 'done'})
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
						this.message.messages.push({
							id: rest.name,
							name: rest.name,
							role: 'tool',
							status: 'done'
						})
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
			})
		)
	}

	updateState(state: Partial<ChatAgentState>) {
		this.graph.updateState(
			{
				configurable: {
					thread_id: this.id
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

	async updateMessage(message: CopilotChatMessage) {
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
}
