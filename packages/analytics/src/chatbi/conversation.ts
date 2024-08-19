import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { BaseMessage, HumanMessage, isAIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages'
import { FewShotPromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { ToolInputParsingException } from '@langchain/core/tools'
import { CompiledStateGraph, END, GraphValueError, START } from '@langchain/langgraph'
import { IChatBIModel, ISemanticModel, OrderTypeEnum } from '@metad/contracts'
import { AgentRecursionLimit, createAgentStepsInstructions, nanoid, referencesCommandName } from '@metad/copilot'
import {
	CubeVariablePrompt,
	EntityType,
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
import { formatDocumentsAsString } from 'langchain/util/document'
import { groupBy } from 'lodash'
import { BehaviorSubject, firstValueFrom, Subject, takeUntil } from 'rxjs'
import { ChatBIModelService } from '../chatbi-model/chatbi-model.service'
import { AgentState, createReactAgent } from '../core/index'
import { createDimensionMemberRetriever, SemanticModelMemberService } from '../model-member/index'
import { getSemanticModelKey, NgmDSCoreService, registerModel } from '../model/ocap'
import { ChatBIService } from './chatbi.service'
import { markdownCubes } from './graph/index'
import { createLLM } from './llm'
import {
	createChatAnswerTool,
	createCubeContextTool,
	createDimensionMemberRetrieverTool,
	createEndTool,
	createFormulaTool,
	createPickCubeTool,
	errorWithEndMessage
} from './tools'
import { C_CHATBI_END_CONVERSATION, ChatBILarkContext, IChatBIConversation, insightAgentState } from './types'

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

	private readonly status$ = new BehaviorSubject<'init' | 'pending' | 'running'>('init')

	private thinkingMessageId: string | null = null

	constructor(
		private readonly chatContext: ChatBILarkContext,
		private readonly copilot: Copilot,
		private readonly modelService: ChatBIModelService,
		private readonly semanticModelMemberService: SemanticModelMemberService,
		private readonly copilotCheckpointSaver: CopilotCheckpointSaver,
		private readonly dsCoreService: NgmDSCoreService,
		private readonly copilotKnowledgeService: CopilotKnowledgeService,
		private readonly chatBIService: ChatBIService
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

		this.logger.debug(`Chat models visits:`, models.map(({ visits }) => visits).join(', '))

		this.models = models
		this.indicators$.next([])

		this.graph.updateState(
			{
				configurable: {
					thread_id: this.threadId
				}
			},
			{ language: `Please answer in language 'zh-Hans'` }
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
				dsCoreService: this.dsCoreService,
				conversation: this
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

		const getCubeContext = createCubeContextTool(
			{
				logger: this.logger,
				conversation: this,
				dsCoreService: this.dsCoreService,
				larkService: chatContext.larkService
			},
			this.modelService
		)
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

Hi, 我是 **ChatBI**, 我可以根据你的问题分析数据、生成图表, 猜你想问：
- 关于数据集 AAAAA, 您可能关心的问题：
	《查看去年 <measure> 随时间月份的变化情况》
	《按照 <dimension> 展示去年总的 <measure>》
	《比较 过去2年 <dimension> 成员之间 <measure> 比例情况》
- 关于数据集 BBBBB, 您可能关心的问题：
	《查看今年 <measure> 按照 <dimension> 的排名，前10名。》
	《按照  <dimension> 展示去年总的 <measure>》
  ...

还有更多模型可以询问：
- 模型信息
- 模型信息

您也可以对我说“**结束对话**”来结束本轮对话。

The models context is:
{{context}}

如果用户询问了更多模型的相关问题，没有相应 cube context 时请调用 'getCubeContext' tool 获取信息。

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
			}
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

	async ask(text: string) {
		this.status$.next('running')
		this.thinkingMessageId = await this.createThinkingMessage()

		await this.initThread()
		// Cube context
		let context = null
		const session = this.chatBIService.userSessions[this.userId]
		if (!this.context && this.chatType === 'p2p' && session?.cubeName) {
			const modelId = session.modelId
			const cubeName = session.cubeName
			// context = await conversation.switchContext(modelId, cubeName)
			this.context = context
		} else {
			context = this.context
		}

		const content = await this.exampleFewShotPrompt.format({ input: text })
		const references = await this.copilotKnowledgeRetriever.pipe(formatDocumentsAsString).invoke(content)

		const streamResults = await this.graph.stream(
			{
				input: text,
				messages: [new HumanMessage(content)],
				context,
				references
			},
			{
				configurable: {
					thread_id: this.threadId
				},
				recursionLimit: AgentRecursionLimit
				// debug: true
			}
		)
		let verboseContent = ''
		let end = false
		try {
			for await (const output of streamResults) {
				if (!output?.__end__) {
					let content = ''
					Object.entries(output).forEach(
						([key, value]: [
							string,
							{
								messages?: HumanMessage[]
								next?: string
								instructions?: string
								reasoning?: string
							}
						]) => {
							content += content ? '\n' : ''
							// Prioritize Routes
							if (value.next) {
								if (value.next === 'FINISH' || value.next === END) {
									end = true
								} else {
									content +=
										`<b>${key}</b>` +
										'\n\n<b>' +
										'Invoke' +
										`</b>: ${value.next}` +
										'\n\n<b>' +
										'Instructions' +
										`</b>: ${value.instructions || ''}` +
										'\n\n<b>' +
										'Reasoning' +
										`</b>: ${value.reasoning || ''}`
								}
							} else if (value.messages) {
								const _message = value.messages[0]
								if (isAIMessage(_message)) {
									if (_message.tool_calls?.length > 0) {
										//
									} else if (_message.content) {
										//   if (this.verbose()) {
										//     content += `<b>${key}</b>\n`
										//   }
										content += value.messages.map((m) => m.content).join('\n\n')
									}
								}
							}
						}
					)

					if (content) {
						verboseContent = content
						this.messageWithEndAction({
							tag: 'markdown',
							content: verboseContent
						})
					}
					// if (abort()) {
					//   break
					// }
				}
			}
		} catch (err: any) {
			console.error(err)
			if (err instanceof ToolInputParsingException) {
				this.chatContext.larkService.errorMessage(this.chatContext, err)
			} else if (err instanceof GraphValueError) {
				end = true
			} else {
				// larkService.errorMessage(input, err)
				errorWithEndMessage(this.chatContext, err.message, this)
			}
		}
	}

	async createThinkingMessage() {
		const result = await this.chatContext.larkService.interactiveMessage(this.chatContext, {
			header: {
				title: {
					tag: 'plain_text',
					content: '正在思考...'
				},
				template: 'blue',
				ud_icon: {
					token: 'myai_colorful', // 图标的 token
					style: {
						color: 'red' // 图标颜色
					}
				}
			}
		})
		return result.data.message_id
	}

	async answerMessage(card: any) {
		const thinkingMessageId = this.thinkingMessageId
		if (thinkingMessageId) {
			this.thinkingMessageId = null
			return await this.chatContext.larkService.patchInteractiveMessage(thinkingMessageId, card)
		} else {
			return await this.chatContext.larkService.interactiveMessage(this.chatContext, card)
		}
	}

	async getCubeCache(modelId: string, cubeName: string) {
		return await this.chatBIService.cacheManager.get<EntityType>(modelId + '/' + cubeName)
	}
	async setCubeCache(modelId: string, cubeName: string, data: EntityType): Promise<void> {
		await this.chatBIService.cacheManager.set(modelId + '/' + cubeName, data)
	}

	messageWithEndAction(content: any) {
		const thinkingMessageId = this.thinkingMessageId
		const message = {
			config: {
				wide_screen_mode: true
			},
			elements: [
				content,
				{
					tag: 'action',
					actions: [
						{
							tag: 'button',
							text: {
								tag: 'plain_text',
								content: '结束对话'
							},
							type: 'primary_text',
							complex_interaction: true,
							width: 'default',
							size: 'medium',
							value: C_CHATBI_END_CONVERSATION
						}
					]
				}
			]
		}

		let action = null
		if (thinkingMessageId) {
			this.thinkingMessageId = null
			action = this.chatContext.larkService.patchAction(thinkingMessageId, message)
		} else {
			action = this.chatContext.larkService.createAction(this.chatContext.chatId, message)
		}
		action.subscribe(async (action) => {
			if (action?.value === C_CHATBI_END_CONVERSATION || action?.value === `"${C_CHATBI_END_CONVERSATION}"`) {
				await this.newThread()
				await this.chatContext.larkService.textMessage(
					this.chatContext,
					`对话已结束。如果您有其他问题，欢迎随时再来咨询。`
				)
			}
		})
	}
}

function isToolMessage(message: BaseMessage): message is ToolMessage {
	return message instanceof ToolMessage
}
