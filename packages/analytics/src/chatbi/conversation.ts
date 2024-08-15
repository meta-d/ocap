import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { CompiledStateGraph, START } from '@langchain/langgraph'
import {
	AgentState,
	createAgentStepsInstructions,
	createReactAgent,
	nanoid,
} from '@metad/copilot'
import { CubeVariablePrompt, Indicator, isEntityType, makeCubeRulesPrompt, markdownModelCube, PROMPT_RETRIEVE_DIMENSION_MEMBER, PROMPT_TIME_SLICER, Schema } from '@metad/ocap-core'
import { CopilotCheckpointSaver } from '@metad/server-core'
import { Logger } from '@nestjs/common'
import { groupBy } from 'lodash'
import { BehaviorSubject, firstValueFrom, Subject, takeUntil } from 'rxjs'
import { SemanticModel } from '../model'
import { createDimensionMemberRetriever, SemanticModelMemberService } from '../model-member/index'
import { getSemanticModelKey, NgmDSCoreService, registerModel } from '../model/ocap'
import {
	createChatAnswerTool,
	createDimensionMemberRetrieverTool,
	createEndTool,
	createFormulaTool,
	createPickCubeTool
} from './tools'
import { ChatBILarkContext, IChatBIConversation, insightAgentState } from './types'

export class ChatBIConversation implements IChatBIConversation {
	private readonly logger = new Logger(ChatBIConversation.name)

	public id: string = nanoid()
	private destroy$: Subject<void> = new Subject<void>()
	public graph: CompiledStateGraph<AgentState, Partial<AgentState>, typeof START | 'agent' | 'tools'>

	get userId() {
		return this.chatContext.userId
	}
	get chatId() {
		return this.chatContext.chatId
	}
	get chatType() {
		return this.chatContext.chatType
	}
	public get threadId() {
		return this.chatContext.userId + '/' + this.chatContext.chatId + '/' + this.id
	}

	public context: string = null

	private readonly indicators$ = new BehaviorSubject<Indicator[]>([])
	constructor(
		private readonly chatContext: ChatBILarkContext,
		private readonly models: SemanticModel[],
		private readonly llm: BaseChatModel,
		private readonly semanticModelMemberService: SemanticModelMemberService,
		private readonly copilotCheckpointSaver: CopilotCheckpointSaver,
		private readonly dsCoreService: NgmDSCoreService
	) {
		// Register all models
		models.forEach((model) => this.registerModel(model))

		// Indicators
		this.indicators$.pipe(takeUntil(this.destroy$)).subscribe(async (indicators) => {
			const models = groupBy(indicators, 'modelId')
			for await (const modelId of Object.keys(models)) {
				const indicators = models[modelId]
				const modelKey = this.getModelKey(modelId)
				const dataSource = await this.dsCoreService._getDataSource(modelKey)
				const schema = dataSource.options.schema
				const _indicators = [...(schema?.indicators ?? [])].filter(
					(indicator) => !indicators.some((item) => item.id === indicator.id || item.code === indicator.code)
				)
				_indicators.push(...indicators)
				dataSource.setSchema({
					...(dataSource.options.schema ?? {}),
					indicators: _indicators
				} as Schema)
			}
		})

		this.graph = this.createAgentGraph()
	}

	getModel(id: string) {
		return this.models.find((item) => item.id === id)
	}
	getModelKey(id: string) {
		const model = this.getModel(id)
		return getSemanticModelKey(model)
	}

	upsertIndicator(indicator: any) {
		this.logger.debug(`New indicator in chatbi:`, indicator)
		const indicators = [...this.indicators$.value]
		const index = indicators.findIndex((item) => item.id === indicator.id)
		if (index > -1) {
			indicators[index] = {
				...indicators[index],
				...indicator
			}
		} else {
			indicators.push({ ...indicator, visible: true })
		}

		this.indicators$.next(indicators)
	}

	newThread() {
		this.id = nanoid()
	}

	destroy() {
		this.destroy$.next()
	}

	registerModel(model: SemanticModel) {
		registerModel(model, this.dsCoreService)
	}

	async switchContext(modelId: string, cubeName: string) {
		// Get Data Source
		const modelKey = this.getModelKey(modelId)
		const modelDataSource = await this.dsCoreService._getDataSource(modelKey)
		// Get entity type context
		const entityType = await firstValueFrom(modelDataSource.selectEntityType(cubeName))
		if (!isEntityType(entityType)) {
			throw entityType
		}
		const context = markdownModelCube({ modelId, dataSource: modelKey, cube: entityType })
		this.context = context
		return context
	}

	createAgentGraph() {
		const chatId = this.chatId
		const chatContext = this.chatContext
		const memberRetriever = createDimensionMemberRetriever({ logger: this.logger }, this.semanticModelMemberService)
		const answerTool = createChatAnswerTool(
			{ chatId, logger: this.logger, larkService: chatContext.larkService, dsCoreService: this.dsCoreService },
			chatContext
		)
		const pickCubeTool = createPickCubeTool(
			{
				chatId,
				logger: this.logger,
				larkService: chatContext.larkService,
				dsCoreService: this.dsCoreService
			},
			this.models,
			chatContext
		)
		const endTool = createEndTool({
			logger: this.logger,
			conversation: this
		})
		const createFormula = createFormulaTool(
			{
				logger: this.logger,
				conversation: this
			},
			chatContext
		)

		const tools = [
			createDimensionMemberRetrieverTool(memberRetriever),
			createFormula,
			answerTool,
			pickCubeTool,
			endTool
		]
		return createReactAgent({
			state: insightAgentState,
			llm: this.llm,
			checkpointSaver: this.copilotCheckpointSaver,
			// interruptBefore,
			// interruptAfter,
			tools: [...tools],
			messageModifier: async (state) => {
				const systemTemplate = `You are a professional BI data analyst.
The cube context is:
{{context}}

If the cube context is empty, please call 'pickCube' tool to select a cube context firstly.
If the user explicitly wants to end the conversation, call the 'end' tool to end.
${makeCubeRulesPrompt()}
${PROMPT_RETRIEVE_DIMENSION_MEMBER}
${PROMPT_TIME_SLICER}

If you add two or more measures to the chart, and the measures have different units, set the role of the measures with different units to different axes.

${createAgentStepsInstructions(
	`Extract the information mentioned in the problem into 'dimensions', 'measurements', 'time', 'slicers', etc.`,
	`Determine whether measure exists in the Cube information. If it does, proceed directly to the next step. If not found, call the 'createFormula' tool to create a indicator for that. After creating the indicator, you need to call the subsequent steps to re-answer the complete answer.`,
	CubeVariablePrompt,
	`If the time condition is a specified fixed time (such as 2023 year, 202202, 2020 Q1), please add it to 'slicers' according to the time dimension. If the time condition is relative (such as this month, last month, last year), please add it to 'timeSlicers'.`,
	`Final call 'answerQuestion' tool to answer question, use the complete conditions to answer`
)}
`
				const system = await SystemMessagePromptTemplate.fromTemplate(systemTemplate, {
					templateFormat: 'mustache'
				}).format({ ...state })
				return [new SystemMessage(system), ...state.messages]
			}
		})
	}
}
