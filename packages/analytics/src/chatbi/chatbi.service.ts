import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { AIMessage, SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { CompiledStateGraph } from '@langchain/langgraph/web'
import { ChatOllama } from '@langchain/ollama'
import { ChatOpenAI, ClientOptions } from '@langchain/openai'
import { AiProviderRole, ICopilot } from '@metad/contracts'
import {
	AiProvider,
	createAgentStepsInstructions,
	createReactAgent,
	CubeVariablePrompt,
	makeCubeRulesPrompt,
	PROMPT_RETRIEVE_DIMENSION_MEMBER
} from '@metad/copilot'
import { CopilotService } from '@metad/server-core'
import { Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { Subject, Subscriber } from 'rxjs'
import { ChatBIAgentState, insightAgentState } from './types'
import { createDimensionMemberRetrieverTool } from './tools'
import { SemanticModelMemberService } from '../model-member/member.service'
import { createDimensionMemberRetriever } from '../model-member/retriever'

export function createLLM<T = ChatOpenAI | BaseChatModel>(
	copilot: ICopilot,
	clientOptions: ClientOptions,
	tokenRecord: (input: { copilot: ICopilot; tokenUsed: number }) => void
): T {
	switch (copilot?.provider) {
		case AiProvider.OpenAI:
		case AiProvider.Azure:
			return new ChatOpenAI({
				apiKey: copilot.apiKey,
				configuration: {
					baseURL: copilot.apiHost || null,
					...(clientOptions ?? {})
				},
				model: copilot.defaultModel,
				temperature: 0,
				callbacks: [
					{
						handleLLMEnd(output) {
							// console.log(output.llmOutput?.totalTokens)
							// let tokenUsed = 0
							// output.generations?.forEach((generation) => {
							// 	generation.forEach((item) => {
							// 		tokenUsed += (<AIMessage>(item as any).message).usage_metadata?.total_tokens ?? 0
							// 	})
							// })
							tokenRecord({ copilot, tokenUsed: output.llmOutput?.totalTokens ?? 0 })
						}
					}
				]
			}) as T
		case AiProvider.Ollama:
			return new ChatOllama({
				baseUrl: copilot.apiHost || null,
				model: copilot.defaultModel,
				callbacks: [
					{
						handleLLMEnd(output) {
							let tokenUsed = 0
							output.generations?.forEach((generation) => {
								generation.forEach((item) => {
									tokenUsed += (<AIMessage>(item as any).message).usage_metadata.total_tokens
								})
							})
							tokenRecord({ copilot, tokenUsed })
						}
					}
				]
			}) as T
		default:
			return null
	}
}

@Injectable()
export class ChatBIService {
	readonly userConversations = new Map<
		string,
		CompiledStateGraph<ChatBIAgentState, Partial<ChatBIAgentState>, '__start__' | 'agent' | 'tools'>
	>()

	readonly userSessions: Record<string, {modelId: string; cube: string}> = {}

	constructor(
		private readonly copilotService: CopilotService,
		private readonly semanticModelMemberService: SemanticModelMemberService,
		private readonly commandBus: CommandBus
	) {}

	async getUserConversation(tenantId: string, key: string, subscriber: Subscriber<unknown>) {
		if (!this.userConversations.get(key)) {
			const { items } = await this.copilotService.findAllWithoutOrganization({ where: { tenantId } })
			const copilot = items.find((item) => item.role === AiProviderRole.Primary)
			const llm = createLLM<BaseChatModel>(copilot as any, {}, (input) => {
				//
			})

			const memberRetriever = createDimensionMemberRetriever(this.semanticModelMemberService)

			const tools = [
				createDimensionMemberRetrieverTool(subscriber, memberRetriever)
			]
			const graph = createReactAgent({
				state: insightAgentState,
				llm,
				// checkpointSaver: checkpointer,
				// interruptBefore,
				// interruptAfter,
				tools: [...tools],
				messageModifier: async (state) => {
					const systemTemplate = `You are a professional BI data analyst.
${makeCubeRulesPrompt()}
${PROMPT_RETRIEVE_DIMENSION_MEMBER}

If you add two or more measures to the chart, and the measures have different units, set the role of the measures with different units to different axes.

${createAgentStepsInstructions(
	`Extract the information mentioned in the problem into 'dimensions', 'measurements', 'time', 'slicers', etc.`,
	`Determine whether measure exists in the Cube information. If it does, proceed directly to the next step. If not found, call the 'createFormula' tool to create a indicator for that. After creating the indicator, you need to call the subsequent steps to re-answer the complete answer.`,
	CubeVariablePrompt,
	`Add the time and slicers to slicers in tool, if the measure to be displayed is time-related, add the current period as a filter to the 'timeSlicers'.`,
	`Final call 'answerQuestion' tool to answer question, use the complete conditions to answer`
)}
		  `
					const system = await SystemMessagePromptTemplate.fromTemplate(systemTemplate, {
						templateFormat: 'mustache'
					}).format({ ...state })
					return [new SystemMessage(system), ...state.messages]
				}
			})

			this.userConversations.set(key, graph)
		}

		return this.userConversations.get(key)
	}
}
