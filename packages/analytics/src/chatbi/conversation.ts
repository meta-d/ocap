import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { BaseMessage, SystemMessage, ToolMessage } from '@langchain/core/messages'
import { FewShotPromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { CompiledStateGraph, END, START } from '@langchain/langgraph'
import { IChatBIModel, ISemanticModel, OrderTypeEnum } from '@metad/contracts'
import { createAgentStepsInstructions, nanoid, referencesCommandName } from '@metad/copilot'
import {
	CubeVariablePrompt,
	Indicator,
	makeCubeRulesPrompt,
	PROMPT_RETRIEVE_DIMENSION_MEMBER,
	PROMPT_TIME_SLICER,
	Schema
} from '@metad/ocap-core'
import {
	Copilot,
	CopilotCheckpointSaver,
	CopilotKnowledgeRetriever,
	CopilotKnowledgeService,
	createCopilotKnowledgeRetriever,
	createExampleFewShotPrompt
} from '@metad/server-core'
import { Logger } from '@nestjs/common'
import { groupBy } from 'lodash'
import { BehaviorSubject, firstValueFrom, Subject, takeUntil } from 'rxjs'
import { ChatBIModelService } from '../chatbi-model/chatbi-model.service'
import { AgentState, createReactAgent } from '../core/index'
import { createDimensionMemberRetriever, SemanticModelMemberService } from '../model-member/index'
import { getSemanticModelKey, NgmDSCoreService, registerModel } from '../model/ocap'
import { createLLM } from './llm'
import {
	createChatAnswerTool,
	createCubeContextTool,
	createDimensionMemberRetrieverTool,
	createEndTool,
	createFormulaTool,
	createPickCubeTool
} from './tools'
import { ChatBILarkContext, IChatBIConversation, insightAgentState } from './types'
import { markdownCubes } from './graph/index'

export class ChatBIConversation implements IChatBIConversation {
	private readonly logger = new Logger(ChatBIConversation.name)
	readonly commandName = 'chatbi'

	public id: string = null
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
	get tenantId() {
		return this.chatContext.tenant.id
	}
	get organizationId() {
		return this.copilot.organizationId
	}

	public context: string = null

	private readonly indicators$ = new BehaviorSubject<Indicator[]>([])

	public copilotKnowledgeRetriever: CopilotKnowledgeRetriever
	public exampleFewShotPrompt: FewShotPromptTemplate

	private models: IChatBIModel[]
	constructor(
		private readonly chatContext: ChatBILarkContext,
		private readonly copilot: Copilot,
		private readonly modelService: ChatBIModelService,
		private readonly semanticModelMemberService: SemanticModelMemberService,
		private readonly copilotCheckpointSaver: CopilotCheckpointSaver,
		private readonly dsCoreService: NgmDSCoreService,
		private readonly copilotKnowledgeService: CopilotKnowledgeService
	) {
		this.copilotKnowledgeRetriever = createCopilotKnowledgeRetriever(this.copilotKnowledgeService, {
			tenantId: this.tenantId,
			// 知识库跟着 copilot 的配置
			organizationId: this.organizationId,
			command: [referencesCommandName(this.commandName), referencesCommandName('calculated')],
			k: 3
		})
		this.exampleFewShotPrompt = createExampleFewShotPrompt(this.copilotKnowledgeService, {
			tenantId: this.tenantId,
			// 知识库跟着 copilot 的配置
			organizationId: this.organizationId,
			command: this.commandName,
			k: 1
		})

		// Indicators
		this.indicators$.pipe(takeUntil(this.destroy$)).subscribe(async (indicators) => {
			const models = groupBy(indicators, 'modelId')
			for await (const modelId of Object.keys(models)) {
				const indicators = models[modelId]
				const modelKey = this.getModelKey(modelId)
				const dataSource = await firstValueFrom(this.dsCoreService.getDataSource(modelKey))
				const schema = dataSource.options.schema
				const _indicators = [...(schema?.indicators ?? [])].filter(
					(indicator) => !indicators.some((item) => item.id === indicator.id || item.code === indicator.code)
				)
				_indicators.push(...indicators)

				this.logger.debug(`Set New indicators for dataSource ${dataSource.id}:`, _indicators)

				dataSource.setSchema({
					...(dataSource.options.schema ?? {}),
					indicators: _indicators
				} as Schema)
			}
		})

		this.graph = this.createAgentGraph()
	}

	async initThread() {
		if (!this.id) {
			await this.newThread()
		}
	}

	getModel(id: string) {
		return this.models.find((item) => item.modelId === id)?.model
	}
	getModelKey(id: string) {
		const model = this.getModel(id)
		return getSemanticModelKey(model)
	}

	upsertIndicator(indicator: any) {
		this.logger.debug(`New indicator in chatbi:`, indicator)
		const indicators = [...this.indicators$.value]
		const index = indicators.findIndex((item) => item.id === indicator.id || item.code === indicator.code)
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

	async newThread() {
		this.id = nanoid()

		const { items: models } = await this.modelService.findAll({
			where: { tenantId: this.chatContext.tenant.id, organizationId: this.chatContext.organizationId },
			relations: ['model', 'model.dataSource', 'model.dataSource.type', 'model.roles', 'model.indicators'],
			order: {
				visits: OrderTypeEnum.DESC
			}
		})

		this.logger.debug(`Chat models visits:`, models.map(({visits}) => visits).join(', '))

		this.models = models
		this.indicators$.next([])

		this.graph.updateState({
			configurable: {
				thread_id: this.threadId
			}},
			{language: `Please answer in language 'zh-Hans'`}
		)

		// Register all models
		this.models.forEach((item) => this.registerModel(item.model))

		const top3Cubes = this.models.slice(0, 3)
		const restCubes = this.models.slice(3)

		this.context = `The top 3 cubes info:
${markdownCubes(top3Cubes)}
${restCubes.length ? `The rest cubes:` : ''}
${markdownCubes(this.models.slice(3))}
`		
	}

	destroy() {
		this.destroy$.next()
	}

	registerModel(model: ISemanticModel) {
		registerModel(model, this.dsCoreService)
	}

	// async switchContext(modelId: string, cubeName: string) {
	// 	// Get Data Source
	// 	const modelKey = this.getModelKey(modelId)
	// 	const modelDataSource = await firstValueFrom(this.dsCoreService.getDataSource(modelKey))
	// 	// Get entity type context
	// 	const entityType = await firstValueFrom(modelDataSource.selectEntityType(cubeName))
	// 	if (!isEntityType(entityType)) {
	// 		throw entityType
	// 	}
	// 	const context = markdownModelCube({ modelId, dataSource: modelKey, cube: entityType })
	// 	this.context = context
	// 	return context
	// }

	createAgentGraph() {
		const chatId = this.chatId
		const chatContext = this.chatContext
		const memberRetriever = createDimensionMemberRetriever({ logger: this.logger }, this.semanticModelMemberService)
		const answerTool = createChatAnswerTool(
			{
				chatId,
				logger: this.logger,
				larkService: chatContext.larkService,
				dsCoreService: this.dsCoreService
			},
			chatContext
		)
		const pickCubeTool = createPickCubeTool(
			{
				chatId,
				logger: this.logger,
				larkService: chatContext.larkService,
				dsCoreService: this.dsCoreService
			},
			this.models
		)

		const getCubeContext = createCubeContextTool({
			logger: this.logger,
			conversation: this,
			dsCoreService: this.dsCoreService,
			larkService: chatContext.larkService
		}, this.modelService)
		const endTool = createEndTool({
			logger: this.logger,
			conversation: this,
			larkService: chatContext.larkService
		})
		const createFormula = createFormulaTool(
			{
				logger: this.logger,
				conversation: this,
				larkService: chatContext.larkService
			},
			chatContext
		)

		const tools = [
			createDimensionMemberRetrieverTool(
				this.tenantId,
				// 知识库跟着 copilot 的配置
				this.organizationId,
				memberRetriever
			),
			getCubeContext,
			createFormula,
			answerTool,
			// pickCubeTool,
			endTool
		]

		const llm = createLLM<BaseChatModel>(this.copilot, {}, (input) => {
			//
		})
		return createReactAgent({
			state: insightAgentState,
			llm,
			checkpointSaver: this.copilotCheckpointSaver,
			// interruptBefore,
			// interruptAfter,
			tools: [...tools],
			messageModifier: async (state) => {
				const systemTemplate = `You are a professional BI data analyst.
{{language}}
在最开始没有收到用户明确问题时，根据 models context 列出的可选择的 cubes 信息，请使用 'getCubeContext' tool 获取 top 3 cubes 的 info context，然后根据这些 cube 维度 度量和指标信息给出 welcome message。
Welcome message 格式如下：
\`\`\`
猜你想问：
- 关于数据集 AAAAA, 您可能关心的问题：
  1. 去年 <measure> 随时间的变化情况
  2. Show the total <measure> by <dimension> for the last year.
  3. Compare the <measure> growth rate of <dimension member> over the past five years.
- 关于数据集 BBBBB, 您可能关心的问题：
  ...

还有更多模型可以询问：
- 模型信息
- 模型信息
-
您也可以对我说“结束对话”来结束本轮对话。
\`\`\`

如果用户询问了更多模型的相关问题，没有相应 cube context 时请调用 'getCubeContext' tool 获取信息。

The models context is:
{{context}}

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
	`Final call 'answerQuestion' tool to show complete answer to user, don't create image for answer`,
	`For the current data analysis, give more analysis suggestions, 3 will be enough.`
)}
`
				const system = await SystemMessagePromptTemplate.fromTemplate(systemTemplate, {
					templateFormat: 'mustache'
				}).format({ ...state })
				return [new SystemMessage(system), ...state.messages]
			},
			// shouldToolContinue: (state) => {
			// 	const lastMessage = state.messages[state.messages.length - 1]
			// 	console.log(lastMessage.name)
			// 	if (isToolMessage(lastMessage) && lastMessage.name === 'welcome') {
			// 		return END
			// 	}
			// 	return 'agent'
			// }
		})
	}
}

function isToolMessage(message: BaseMessage): message is ToolMessage {
	return message instanceof ToolMessage
}
