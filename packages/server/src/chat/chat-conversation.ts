import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { AIMessageChunk, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { CompiledStateGraph, START } from '@langchain/langgraph'
import { CopilotChatMessage, IChatConversation, IUser } from '@metad/contracts'
import { AgentRecursionLimit } from '@metad/copilot'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { filter, from, map, tap } from 'rxjs'
import { ChatConversationUpdateCommand } from '../chat-conversation'
import { FindChatConversationQuery } from '../chat-conversation/'
import { Copilot, createLLM, createReactAgent } from '../copilot'
import { CopilotCheckpointSaver } from '../copilot-checkpoint'
import { CopilotTokenRecordCommand } from '../copilot-user/commands'
import { ChatAgentState, chatAgentState } from './types'
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";



export class ChatConversationAgent {
	public graph: CompiledStateGraph<ChatAgentState, Partial<ChatAgentState>, typeof START | 'agent' | 'tools'>
	private conversation: IChatConversation = null
	constructor(
		public readonly id: string,
		public readonly organizationId: string,
		private readonly user: IUser,
		private readonly copilot: Copilot,
		private readonly copilotCheckpointSaver: CopilotCheckpointSaver,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {
		this.graph = this.createAgentGraph()
	}

	createAgentGraph() {



		const llm = createLLM<BaseChatModel>(this.copilot, {}, (input) => {
			// console.log(input)
			this.commandBus.execute(
				new CopilotTokenRecordCommand({
					...input,
					tenantId: this.copilot.tenantId,
					userId: this.user.id,
					copilot: this.copilot
				})
			)
		})

		const tavilySearchTool = new TavilySearchResults({
			apiKey: '',
			maxResults: 2,
		})

		const wikiTool = new WikipediaQueryRun({
			topKResults: 3,
			maxDocContentLength: 4000,
		  });

		const duckTool = new DuckDuckGoSearch({ maxResults: 1 });

		const tools = [tavilySearchTool, wikiTool, duckTool]

		return createReactAgent({
			state: chatAgentState,
			llm,
			checkpointSaver: this.copilotCheckpointSaver,
			// interruptBefore,
			// interruptAfter,
			tools: [...tools],
			messageModifier: async (state) => {
				const systemTemplate = `{{language}}
References documents:
{{context}}
`
				const system = await SystemMessagePromptTemplate.fromTemplate(systemTemplate, {
					templateFormat: 'mustache'
				}).format({ ...state })
				return [new SystemMessage(system), ...state.messages]
			}
		})
	}

	chat(input: string) {
		let aiContent = ''
		return from(this.graph.streamEvents(
			{
				input,
				messages: [new HumanMessage(input)]
			},
			{
				version: 'v2',
				configurable: {
					thread_id: this.id
				},
				recursionLimit: AgentRecursionLimit
				// debug: true
			}
		)).pipe(
			tap(({ event }: any) => console.log(`streamEvents event type of graph:`, event)),
			// filter(({ event }: any) => event === 'on_chat_model_stream'),
			map(({ event, data }: any) => {
				// console.log(event)
			    if (event === 'on_chat_model_stream') {
					const msg = data.chunk as AIMessageChunk
					if (!msg.tool_call_chunks?.length) {
						// console.log(msg.content)
						aiContent += msg.content
						return {
							event,
							content: msg.content
						}
					}
				} else if (event === 'on_chat_model_end') {
					return {
						event,
						content: aiContent
					}
				} else if (['on_chain_start', 'on_chain_end'].includes(event)) {
					console.log(data)
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

	async updateMessage(message: CopilotChatMessage) {
		// Record conversation messages
		if (!this.conversation) {
			this.conversation = await this.queryBus.execute(
				new FindChatConversationQuery({
					tenantId: this.user.tenantId,
					organizationId: this.organizationId,
					id: this.id
				})
			)
		}
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
