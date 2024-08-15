import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { CompiledStateGraph, START } from '@langchain/langgraph'
import { ISemanticModel } from '@metad/contracts'
import {
	AgentState,
	createAgentStepsInstructions,
	createReactAgent,
	CubeVariablePrompt,
	makeCubeRulesPrompt,
	nanoid,
	PROMPT_RETRIEVE_DIMENSION_MEMBER
} from '@metad/copilot'
import { CopilotCheckpointSaver } from '@metad/server-core'
import { Logger } from '@nestjs/common'
import { Subject } from 'rxjs'
import { createDimensionMemberRetriever, SemanticModelMemberService } from '../model-member/index'
import { NgmDSCoreService } from '../model/ocap'
import { createChatAnswerTool, createDimensionMemberRetrieverTool, createEndTool, createPickCubeTool } from './tools'
import { ChatBILarkContext, IChatBIConversation, insightAgentState } from './types'

export class ChatBIConversation implements IChatBIConversation {
	private readonly logger = new Logger(ChatBIConversation.name)

	public id: string = nanoid()
	private destroy$: Subject<void> = new Subject<void>()
	public graph: CompiledStateGraph<AgentState, Partial<AgentState>, typeof START | 'agent' | 'tools'>

	get userId() {
		return this.chatContext.userId
	}
	get chatType() {
		return this.chatContext.chatType
	}
	public get threadId() {
		return this.chatContext.userId + '/' + this.chatContext.chatId + '/' + this.id
	}

	public context: string = null
	constructor(
		private readonly chatContext: ChatBILarkContext,
		private readonly models: ISemanticModel[],
		private readonly llm: BaseChatModel,
		private readonly semanticModelMemberService: SemanticModelMemberService,
		private readonly copilotCheckpointSaver: CopilotCheckpointSaver,
		private readonly dsCoreService: NgmDSCoreService
	) {
		const { userId, chatId } = chatContext
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
			models,
			chatContext
		)
		const endTool = createEndTool({
			conversation: this
		})

		const tools = [createDimensionMemberRetrieverTool(memberRetriever), answerTool, pickCubeTool, endTool]
		this.graph = createReactAgent({
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
如果用户明确要结束对话，请调用 'end' tool to end the conversation.
${makeCubeRulesPrompt()}
${PROMPT_RETRIEVE_DIMENSION_MEMBER}

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

	newThread() {
		this.id = nanoid()
	}

	destroy() {
		this.destroy$.next()
	}
}
