import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { BaseMessage, HumanMessage, isAIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages'
import { FewShotPromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { DynamicStructuredTool, ToolInputParsingException } from '@langchain/core/tools'
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
	CopilotKnowledgeService,
	createExampleFewShotPrompt,
	createReferencesRetrieverTool
} from '@metad/server-core'
import { Logger } from '@nestjs/common'
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
	errorWithEndMessage
} from './tools'
import { C_CHATBI_END_CONVERSATION, ChatBILarkContext, IChatBIConversation, insightAgentState } from './types'
import { createMoreQuestionsTool } from './tools/more-questions'
import { createWelcomeTool } from './tools/welcome'

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
	// 知识库跟着 copilot 的配置
	get organizationId() {
		return this.copilot.organizationId
	}

	public context: string = null

	private readonly indicators$ = new BehaviorSubject<Indicator[]>([])

	// public copilotKnowledgeRetriever: CopilotKnowledgeRetriever
	public exampleFewShotPrompt: FewShotPromptTemplate
	private referencesRetrieverTool: DynamicStructuredTool = null
	private dimensionMemberRetrieverTool: DynamicStructuredTool = null

	public models: IChatBIModel[]
	public chatModelId: string = null

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
		this.exampleFewShotPrompt = createExampleFewShotPrompt(this.copilotKnowledgeService, {
			tenantId: this.tenantId,
			// 知识库跟着 copilot 的配置
			organizationId: this.organizationId,
			command: this.commandName,
			k: 1
		})

		this.referencesRetrieverTool = createReferencesRetrieverTool(this.copilotKnowledgeService, {
			tenantId: this.tenantId,
			// 知识库跟着 copilot 的配置
			organizationId: this.organizationId,
			command: [referencesCommandName(this.commandName), referencesCommandName('calculated')],
			k: 3
		})

		this.dimensionMemberRetrieverTool = createDimensionMemberRetrieverTool(
			this.tenantId,
			// 知识库跟着 copilot 的配置
			this.organizationId,
			createDimensionMemberRetriever({ logger: this.logger }, this.semanticModelMemberService)
		)

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
		// const pickCubeTool = createPickCubeTool(
		// 	{
		// 		chatId,
		// 		logger: this.logger,
		// 		larkService: chatContext.larkService,
		// 		dsCoreService: this.dsCoreService
		// 	},
		// 	this.models
		// )

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
		)

		const welcomeTool = createWelcomeTool({ conversation: this })
		const moreQuestionsTool = createMoreQuestionsTool({ conversation: this })

		const tools = [
			this.dimensionMemberRetrieverTool,
			this.referencesRetrieverTool,
			getCubeContext,
			welcomeTool,
			createFormula,
			answerTool,
			moreQuestionsTool,
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

如果没有收到用户明确问题时，请根据 models context 调用 'welcome' tool 针对 top 3 的模型分别给出用户可能关心的 3 条问题。

The models context is:
{{context}}

For data models that users ask about, call the 'getCubeContext' tool to get detailed information about dataSource, dimensions, measures before answering the question.

If the user explicitly wants to end the conversation, call the 'end' tool to end.
${makeCubeRulesPrompt()}
${PROMPT_RETRIEVE_DIMENSION_MEMBER}
${PROMPT_TIME_SLICER}

If you have any questions about how to analysis data (such as 'how to create a formula of calculated measure', 'how to create some type chart', 'how to create a time slicer about relative time'), please call 'referencesRetriever' tool to get the reference documentations.

${createAgentStepsInstructions(
	`Extract the information mentioned in the problem into 'dimensions', 'measurements', 'time', 'slicers', etc.`,
	`Determine whether measure exists in the Cube information. If it does, proceed directly to the next step. If not found, call the 'createFormula' tool to create a indicator for that. After creating the indicator, you need to call the subsequent steps to re-answer the complete answer.`,
	CubeVariablePrompt,
	`If the time condition is a specified fixed time (such as 2023 year, 202202, 2020 Q1), please add it to 'slicers' according to the time dimension. If the time condition is relative (such as this month, last month, last year), please add it to 'timeSlicers'.`,
	`Final call 'answerQuestion' tool to show complete answer to user, don't create image for answer`,
	`After answer question, call 'giveMoreQuestions' tool to give more analysis suggestions `
)}
`
				const system = await SystemMessagePromptTemplate.fromTemplate(systemTemplate, {
					templateFormat: 'mustache'
				}).format({ ...state })
				return [new SystemMessage(system), ...state.messages]
			},
			shouldToolContinue: (state) => {
				const lastMessage = state.messages[state.messages.length - 1]
				this.logger.debug(`[ChatBI] [After tool call] name: ${lastMessage.name}`)
				if (isToolMessage(lastMessage) && ['giveMoreQuestions', 'welcome', 'end'].includes(lastMessage.name)) {
					return END
				}
				return 'agent'
			}
		})
	}

	async ask(text: string) {
		this.status$.next('running')
		this.thinkingMessageId = await this.createThinkingMessage()

		await this.initThread()
		// Model context
		let context = null
		const session = this.chatBIService.userSessions[this.userId]
		if (this.chatType === 'p2p' && session?.chatModelId) {
			const chatModel = this.models.find((item) => item.id === session.chatModelId)
			context = markdownCubes([chatModel])
		} else {
			context = this.context
		}

		const content = await this.exampleFewShotPrompt.format({ input: text })

		const streamResults = await this.graph.stream(
			{
				input: text,
				messages: [new HumanMessage(content)],
				context,
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
						this.logger.debug(`[ChatBI] [Graph]: verbose content`, verboseContent)
						// 对话结束时还有正在思考的消息，则意味着出现错误
						if (this.thinkingMessageId) {
							this.messageWithEndAction([{tag: 'markdown', content: `出现内部错误`}])
						}
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

	messageWithEndAction(contents: any[], callback?: (action: any) => void | Promise<void>) {
		const thinkingMessageId = this.thinkingMessageId
		const message = {
			config: {
				wide_screen_mode: true
			},
			elements: [
				...contents,
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
		action.subscribe({
			next: async (action) => {
				if (action?.value === C_CHATBI_END_CONVERSATION || action?.value === `"${C_CHATBI_END_CONVERSATION}"`) {
					await this.end()
				} else {
					callback?.(action)
				}
			},
			error: (err) => {
				console.error(err)
			}
		})
	}

	async textMessage(text: string) {
		const thinkingMessageId = this.thinkingMessageId
		this.thinkingMessageId = null
		return await this.chatContext.larkService.textMessage(
			{chatId: this.chatContext.chatId, messageId: thinkingMessageId},
			text
		)
	}

	async end() {
		const session = this.chatBIService.userSessions[this.userId]
		if (session) {
			session.chatModelId = null
		}

		await this.textMessage(`对话已结束。如果您有其他问题，欢迎随时再来咨询。`)
		await this.newThread()
	}
}

function isToolMessage(message: BaseMessage): message is ToolMessage {
	return message instanceof ToolMessage
}
