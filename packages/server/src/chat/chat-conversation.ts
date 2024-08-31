import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { AIMessageChunk, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { CompiledStateGraph, START } from '@langchain/langgraph'
import { IUser } from '@metad/contracts'
import { AgentRecursionLimit } from '@metad/copilot'
import { CommandBus } from '@nestjs/cqrs'
import { filter, from, map, tap } from 'rxjs'
import { Copilot, createLLM, createReactAgent } from '../copilot'
import { CopilotCheckpointSaver } from '../copilot-checkpoint'
import { CopilotTokenRecordCommand } from '../copilot-user/commands'
import { ChatAgentState, chatAgentState } from './types'

export class ChatConversationAgent {
	public graph: CompiledStateGraph<ChatAgentState, Partial<ChatAgentState>, typeof START | 'agent' | 'tools'>

	constructor(
		public readonly id: string,
		private readonly user: IUser,
		private readonly copilot: Copilot,
		private readonly copilotCheckpointSaver: CopilotCheckpointSaver,
		private readonly commandBus: CommandBus
	) {
		this.graph = this.createAgentGraph()
	}

	createAgentGraph() {
		const llm = createLLM<BaseChatModel>(this.copilot, {}, (input) => {
			console.log(input)
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
		return from(
			this.graph.streamEvents(
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
			)
		).pipe(
			// tap(({ event }: any) => console.log(`streamEvents event type of graph:`, event)),
			filter(({ event }: any) => event === 'on_chat_model_stream'),
			map(({ event, data }: any) => {
				console.log(event)
				const msg = data.chunk as AIMessageChunk
				if (!msg.tool_call_chunks?.length) {
					console.log(msg.content)
					return msg.content
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
}
