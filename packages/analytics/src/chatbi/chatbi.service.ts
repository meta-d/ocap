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
import { isEntityType, markdownModelCube } from '@metad/ocap-core'
import { CopilotCheckpointSaver, CopilotService } from '@metad/server-core'
import { Injectable, Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { firstValueFrom, Subscriber } from 'rxjs'
import { SemanticModelService } from '../model'
import { SemanticModelMemberService } from '../model-member/member.service'
import { createDimensionMemberRetriever } from '../model-member/retriever'
import { getSemanticModelKey, NgmDSCoreService } from '../model/ocap'
import { createChatAnswerTool } from './tools/answer'
import { createDimensionMemberRetrieverTool } from './tools/member-retriever'
import { createPickCubeTool } from './tools/pick-cube'
import { ChatBIAgentState, ChatBILarkContext, ChatBIUserSession, insightAgentState } from './types'

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
	private readonly logger = new Logger(ChatBIService.name)

	readonly userConversations = new Map<
		string,
		{
			chatId: string
			graph: CompiledStateGraph<ChatBIAgentState, Partial<ChatBIAgentState>, '__start__' | 'agent' | 'tools'>
		}
	>()

	readonly userSessions: Record<string, ChatBIUserSession> = {}

	constructor(
		private readonly copilotService: CopilotService,
		private readonly modelService: SemanticModelService,
		private readonly semanticModelMemberService: SemanticModelMemberService,
		private readonly copilotCheckpointSaver: CopilotCheckpointSaver,
		private readonly dsCoreService: NgmDSCoreService,
		private readonly commandBus: CommandBus
	) {}

	async getUserConversation(input: ChatBILarkContext, subscriber: Subscriber<unknown>) {
		const { chatId, userId } = input
		if (!this.userConversations.get(userId)) {
			this.logger.debug(`未找到会话，新建会话为用户：${userId}`)
			try {
				const graph = await this.createChatGraph(input, subscriber)
				this.userConversations.set(userId, { chatId, graph })
			} catch (err) {
				console.error(err)
				subscriber.error(err)
			}
		}

		return this.userConversations.get(userId)
	}

	async createChatGraph(input: ChatBILarkContext, subscriber: Subscriber<unknown>) {
		const { tenant, userId, chatId } = input
		const tenantId = tenant.id
		const { items } = await this.copilotService.findAllWithoutOrganization({ where: { tenantId } })
		const copilot = items.find((item) => item.role === AiProviderRole.Primary)
		const llm = createLLM<BaseChatModel>(copilot as any, {}, (input) => {
			//
		})

		const { items: models } = await this.modelService.findAll({ where: { tenantId } })

		let context = 'Empty'
		// Get user's session
		const session = this.userSessions[userId]
		if (session) {
			const organizationId = session.organizationId
			const modelId = session.modelId
			const cubeName = session.cubeName
			const model = await this.modelService.findOne(modelId, { where: { tenantId, organizationId } })
			// Get Data Source
			const modelKey = getSemanticModelKey(model)
			const modelDataSource = await this.dsCoreService._getDataSource(modelKey)
			// Get entity type context
			const entityType = await firstValueFrom(modelDataSource.selectEntityType(cubeName))
			if (!isEntityType(entityType)) {
				throw entityType
			}
			context = markdownModelCube({ modelId, dataSource: modelKey, cube: entityType })
		}

		const memberRetriever = createDimensionMemberRetriever({ logger: this.logger }, this.semanticModelMemberService)
		const answerTool = createChatAnswerTool(
			{ chatId, logger: this.logger, larkService: input.larkService, dsCoreService: this.dsCoreService },
			subscriber
		)
		const pickCubeTool = createPickCubeTool(
			{
				chatId,
				logger: this.logger,
				larkService: input.larkService,
				dsCoreService: this.dsCoreService
			},
			models,
			subscriber
		)

		const tools = [createDimensionMemberRetrieverTool(memberRetriever), answerTool, pickCubeTool]
		const graph = createReactAgent({
			state: insightAgentState,
			llm,
			checkpointSaver: this.copilotCheckpointSaver,
			// interruptBefore,
			// interruptAfter,
			tools: [...tools],
			messageModifier: async (state) => {
				const systemTemplate = `You are a professional BI data analyst.
The cube context is:
{{context}}

If the cube context is empty, please call 'pickCube' tool to select a cube context firstly.
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
				}).format({ ...state, context })
				return [new SystemMessage(system), ...state.messages]
			}
		})

		return graph
	}

	upsertUserSession(userId: string, value: Partial<ChatBIUserSession>) {
		const session = this.userSessions[userId]
		if (session && (session.cubeName !== value.cubeName || session.modelId !== value.modelId)) {
			// Clear user's conversation
			this.userConversations.set(userId, null)
		}
		this.userSessions[userId] = {
			...(session ?? {}),
			...value
		} as ChatBIUserSession
	}
}
