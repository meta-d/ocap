import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { HumanMessage, isAIMessage, SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { tool } from '@langchain/core/tools'
import { ChatGatewayEvent, ChatGatewayMessage, CopilotToolContext, JSONValue, OrderTypeEnum } from '@metad/contracts'
import { AgentRecursionLimit, createAgentStepsInstructions, referencesCommandName } from '@metad/copilot'
import {
	Agent,
	ChartBusinessService,
	CubeVariablePrompt,
	DataSourceFactory,
	DSCoreService,
	EntityType,
	FilteringLogic,
	isEntitySet,
	makeCubeRulesPrompt,
	markdownModelCube,
	PresentationVariant,
	PROMPT_RETRIEVE_DIMENSION_MEMBER,
	PROMPT_TIME_SLICER,
	toAdvancedFilter,
	tryFixDimension,
	tryFixSlicer,
	tryFixVariableSlicer,
	workOutTimeRangeSlicers
} from '@metad/ocap-core'
import {
	ChatService,
	CopilotCheckpointSaver,
	CopilotKnowledgeService,
	createExampleFewShotPrompt,
	createLLM,
	createReactAgent,
	createReferencesRetrieverTool
} from '@metad/server-ai'
import { CACHE_MANAGER, Inject, Logger } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Cache } from 'cache-manager'
import { firstValueFrom, Subject, Subscriber, switchMap, takeUntil } from 'rxjs'
import { ChatBIModelService } from '../../../chatbi-model/'
import { createDimensionMemberRetriever, SemanticModelMemberService } from '../../../model-member'
import {
	convertOcapSemanticModel,
	NgmDSCoreService,
	OCAP_AGENT_TOKEN,
	OCAP_DATASOURCE_TOKEN,
	registerModel
} from '../../../model/ocap'
import { ChatBIService } from '../../chatbi.service'
import { ChatAnswer, createDimensionMemberRetrieverTool } from '../../tools'
import { ChatAnswerSchema, GetCubesContextSchema, insightAgentState } from '../../types'
import { ChatBINewCommand } from '../chat-bi.command'
import { getErrorMessage, shortuuid } from '@metad/server-common'
import { markdownCubes } from '../../graph'

@CommandHandler(ChatBINewCommand)
export class ChatBINewHandler implements ICommandHandler<ChatBINewCommand> {
	private readonly logger = new Logger(ChatBINewHandler.name)

	readonly commandName = 'chatbi'

	constructor(
		private readonly chatService: ChatService,
		private readonly chatBIService: ChatBIService,
		private readonly modelService: ChatBIModelService,
		private readonly copilotCheckpointSaver: CopilotCheckpointSaver,
		private readonly copilotKnowledgeService: CopilotKnowledgeService,
		private readonly semanticModelMemberService: SemanticModelMemberService,
		@Inject(OCAP_AGENT_TOKEN)
		private agent: Agent,
		@Inject(OCAP_DATASOURCE_TOKEN)
		private dataSourceFactory: { type: string; factory: DataSourceFactory },
		@Inject(CACHE_MANAGER)
		private readonly cacheManager: Cache
	) {
		chatService.registerCommand('ChatBINewCommand', ChatBINewCommand)
	}

	public async execute(command: ChatBINewCommand): Promise<any> {
		const { args, config, context } = command

		// console.log(`execute ChatBINewCommand`, args, config, context)

		// New Ocap context for every chatbi conversation
		const dsCoreService = new NgmDSCoreService(this.agent, this.dataSourceFactory)
		// Register all chat models (改成根据 Copilot 角色来)
		const cubesContext = await this.registerChatModels(dsCoreService, context)
		// Prepare LLM
		const { copilot, chatModel } = context
		const llm =
			<BaseChatModel>chatModel ??
			createLLM<BaseChatModel>(copilot, {}, (input) => {
				//
			})
		const { tenantId, organizationId } = context
		const { thread_id, subscriber } = config.configurable

		// Create graph
		const agent = this.createGraphAgent(llm, context, dsCoreService, subscriber)

		// Few-shot prompt
		const exampleFewShotPrompt = createExampleFewShotPrompt(this.copilotKnowledgeService, {
			tenantId: tenantId,
			// 知识库跟着 copilot 的配置
			organizationId: organizationId,
			command: this.commandName,
			k: 1
		})
		const { question } = args
		const content = await exampleFewShotPrompt.format({ input: question })
		
		try {
			const streamResults = await agent.stream(
				{
					input: question,
					messages: [new HumanMessage(content)],
					context: cubesContext
				},
				{
					configurable: {
						thread_id,
						checkpoint_ns: this.commandName,
						tenantId,
						organizationId,
					},
					recursionLimit: AgentRecursionLimit
					// debug: true
				}
			)

			// let verboseContent = ''
			// let end = false
			for await (const output of streamResults) {
				if (output.agent) {
					//console.log(output.agent.messages)
				}
			}
		} catch (error) {
			console.error(error)
			return `Error:` + getErrorMessage(error)
		}

		const state = await agent.getState({
			configurable: {
				thread_id,
				checkpoint_ns: this.commandName
			}
		})

		const messages = state.values().messages

		return messages[messages.length - 1].content
	}

	async getCubeCache(modelId: string, cubeName: string) {
		return await this.cacheManager.get<EntityType>(modelId + '/' + cubeName)
	}
	async setCubeCache(modelId: string, cubeName: string, data: EntityType): Promise<void> {
		await this.cacheManager.set(modelId + '/' + cubeName, data)
	}

	async registerChatModels(dsCoreService: DSCoreService, context: CopilotToolContext) {
		const { tenantId, organizationId } = context
		const { items } = await this.modelService.findAll({
			where: { tenantId, organizationId },
			relations: ['model', 'model.dataSource', 'model.dataSource.type', 'model.roles', 'model.indicators'],
			order: {
				visits: OrderTypeEnum.DESC
			}
		})

		const models = items.map((item) => ({ ...item, model: convertOcapSemanticModel(item.model) }))

		// Register all models
		models.forEach((item) => registerModel(item.model, dsCoreService))

		return markdownCubes(models)
	}

	createGraphAgent(llm: BaseChatModel, context: CopilotToolContext, dsCoreService: DSCoreService, subscriber: Subscriber<any>) {
		const { tenantId, organizationId } = context

		const referencesRetrieverTool = createReferencesRetrieverTool(this.copilotKnowledgeService, {
			tenantId,
			organizationId,
			command: [referencesCommandName(this.commandName), referencesCommandName('calculated')],
			k: 3
		})
		const dimensionMemberRetrieverTool = createDimensionMemberRetrieverTool(
			tenantId,
			// 知识库跟着 copilot 的配置
			organizationId,
			createDimensionMemberRetriever({ logger: this.logger }, this.semanticModelMemberService)
		)

		const getCubeContext = this.createCubeContextTool(dsCoreService)

		const answerTool = this.createChatAnswerTool({
			dsCoreService,
			entityType: null,
			subscriber
		})

		const tools = [referencesRetrieverTool, dimensionMemberRetrieverTool, getCubeContext, answerTool]

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
	// `For every measure, determine whether it exists in the cube context, if it does, proceed directly to the next step, if not found, call the 'createIndicator' tool to create new calculated measure for it. After creating the measure, you need to call the subsequent steps to re-answer the complete answer.`,
	CubeVariablePrompt,
	`If the time condition is a specified fixed time (such as 2023 year, 202202, 2020 Q1), please add it to 'slicers' according to the time dimension. If the time condition is relative (such as this month, last month, last year), please add it to 'timeSlicers'.`,
	`Then call 'answerQuestion' tool to show complete answer to user, don't create image for answer`
)}
`
				const system = await SystemMessagePromptTemplate.fromTemplate(systemTemplate, {
					templateFormat: 'mustache'
				}).format({ ...state })

				return [new SystemMessage(system), ...state.messages]
			}
		})
	}

	createCubeContextTool(dsCoreService: DSCoreService) {
		return tool(
			async ({ cubes }): Promise<string> => {
				this.logger.debug(`Tool 'getCubeContext' params:`, JSON.stringify(cubes))
				let context = ''
				for await (const item of cubes) {
					this.logger.debug(`  get context for:`, item.modelId, item.name)

					let entityType = await this.getCubeCache(item.modelId, item.name)
					if (!entityType) {
						const entitySet = await firstValueFrom(
							dsCoreService
								.getDataSource(item.modelId)
								.pipe(switchMap((dataSource) => dataSource.selectEntitySet(item.name)))
						)
						if (isEntitySet(entitySet)) {
							entityType = entitySet.entityType
							await this.setCubeCache(item.modelId, item.name, entityType)
						} else {
							this.logger.error(`  get context error: `, entitySet.message)
						}
					}
					if (entityType) {
						if (context) {
							context += '\n'
						}

						context += markdownModelCube({
							modelId: item.modelId,
							dataSource: item.modelId,
							cube: entityType
						})

						// Record visit
						await this.modelService.visit(item.modelId, item.name)
					}
				}

				return context
			},
			{
				name: 'getCubeContext',
				description: 'Get the context info for cubes',
				schema: GetCubesContextSchema
			}
		)
	}

	createChatAnswerTool(context: ChatBIContext) {
		const { dsCoreService } = context

		return tool(
			async (answer: any): Promise<string> => {
				this.logger.debug(`Execute copilot action 'answerQuestion':`, JSON.stringify(answer, null, 2))
				try {
					let entityType = null
					if (answer.dataSettings) {
						// Make sure datasource exists
						const _dataSource = await dsCoreService._getDataSource(answer.dataSettings.dataSource)
						const entity = await firstValueFrom(
							dsCoreService.selectEntitySet(answer.dataSettings.dataSource, answer.dataSettings.entitySet)
						)
						entityType = entity.entityType
					}

					// Fetch data for chart or table or kpi
					if (answer.dimensions?.length || answer.measures?.length) {
						const { data, categoryMembers } = await this.drawChartMessage(
							answer as ChatAnswer,
							{ ...context, entityType }
						)
						// Max limit 20 members
						const members = categoryMembers
							? JSON.stringify(Object.values(categoryMembers).slice(0, 20))
							: 'Empty'

						return `The analysis data has been displayed to the user. The dimension members involved in this data analysis are:
	${members}
	Please give more analysis suggestions about other dimensions or filter by dimensioin members, 3 will be enough.`
					}

					return `图表答案已经回复给用户了，请不要重复回答了。`
				} catch (err) {
					this.logger.error(err)
					return `Error: ${err}。如果需要用户提供更多信息，请直接提醒用户。`
				}
			},
			{
				name: 'answerQuestion',
				description: 'Show chart answer for the question to user',
				schema: ChatAnswerSchema
			}
		)
	}

	drawChartMessage(answer: ChatAnswer, context: ChatBIContext): Promise<any> {
		const { dsCoreService, entityType, subscriber } = context
		const chartService = new ChartBusinessService(dsCoreService)
		const destroy$ = new Subject<void>()

		const chartAnnotation = {
			chartType: answer.chartType,
			dimensions: answer.dimensions?.map((dimension) => tryFixDimension(dimension, entityType)),
			measures: answer.measures?.map((measure) => tryFixDimension(measure, entityType))
		}

		const slicers = []
		if (answer.variables) {
			slicers.push(...answer.variables.map((slicer) => tryFixVariableSlicer(slicer, entityType)))
		}
		if (answer.slicers) {
			slicers.push(...answer.slicers.map((slicer) => tryFixSlicer(slicer, entityType)))
		}
		if (answer.timeSlicers) {
			const timeSlicers = answer.timeSlicers
				.map((slicer) => workOutTimeRangeSlicers(new Date(), { ...slicer, currentDate: 'TODAY' }, entityType))
				.map((ranges) => toAdvancedFilter(ranges, FilteringLogic.And))
			slicers.push(...timeSlicers)
		}

		const presentationVariant: PresentationVariant = {}
		if (answer.top) {
			presentationVariant.maxItems = answer.top
		}
		if (answer.orders) {
			presentationVariant.sortOrder = answer.orders
		}

		return new Promise((resolve, reject) => {
			const dataSettings = {
				...answer.dataSettings,
				chartAnnotation,
				presentationVariant
			}
			chartService.selectResult().subscribe((result) => {
				if (result.error) {
					reject(result.error)
				} else {
					subscriber.next({
						event: ChatGatewayEvent.Message,
						data: {
							id: shortuuid(),
							role: 'component',
							data: {
								type: 'AnalyticalCard',
								data: result.data,
								dataSettings,
								slicers
							} as unknown as JSONValue
						}
					} as ChatGatewayMessage)
					resolve({ data: result.data, categoryMembers: {} })
				}
				destroy$.next()
				destroy$.complete()
			})

			chartService.selectResult()

			chartService
				.onAfterServiceInit()
				.pipe(takeUntil(destroy$))
				.subscribe(() => {
					chartService.refresh()
				})

			chartService.slicers = slicers
			chartService.dataSettings = dataSettings
		})
	}
}

type ChatBIContext = {
	dsCoreService: DSCoreService
	entityType: EntityType
	subscriber: Subscriber<any>
}
