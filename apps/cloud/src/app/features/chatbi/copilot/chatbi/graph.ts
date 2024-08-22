import { inject } from '@angular/core'
import { isAIMessage, SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { END } from '@langchain/langgraph/web'
import {
  createAgentStepsInstructions,
  CreateGraphOptions,
  createReactAgent,
  referencesCommandName
} from '@metad/copilot'
import {
  CubeVariablePrompt,
  injectDimensionMemberTool,
  makeCubeRulesPrompt,
  PROMPT_RETRIEVE_DIMENSION_MEMBER
} from '@metad/core'
import { injectReferencesRetrieverTool } from 'apps/cloud/src/app/@core/copilot'
import { ChatbiService } from '../../chatbi.service'
import { injectCreateChartTool } from '../tools'
import { injectCreateIndicatorTool, injectMoreQuestionsTool } from './tools'
import { CHATBI_COMMAND_NAME, insightAgentState } from './types'

export function injectCreateInsightGraph() {
  const chatbiService = inject(ChatbiService)
  const memberRetrieverTool = injectDimensionMemberTool()
  const createChartTool = injectCreateChartTool()
  const createIndicatorTool = injectCreateIndicatorTool()
  const moreQuestionsTool = injectMoreQuestionsTool()
  const referencesRetrieverTool = injectReferencesRetrieverTool(
    [referencesCommandName(CHATBI_COMMAND_NAME), referencesCommandName('calculated')],
    { k: 3 }
  )

  const context = chatbiService.context

  return async ({ llm, checkpointer, interruptBefore, interruptAfter }: CreateGraphOptions) => {
    const indicatorTool = createIndicatorTool(llm)
    const tools = [referencesRetrieverTool, memberRetrieverTool, indicatorTool, createChartTool, moreQuestionsTool]

    return createReactAgent({
      state: insightAgentState,
      llm,
      checkpointSaver: checkpointer,
      interruptBefore,
      interruptAfter,
      tools: [...tools],
      messageModifier: async (state) => {
        const systemTemplate = `You are a professional BI data analyst. Use 'answerQuestion' to ask questions and 'giveMoreQuestions' to get more questions.
{{role}}
{{language}}

The cube context is:
{{context}}

${makeCubeRulesPrompt()}

If you have any questions about how to analysis data (such as 'how to create some type chart', 'how to create a time slicer about relative time'), please call 'referencesRetriever' tool to get the reference documentations.

${createAgentStepsInstructions(
  `Extract the information mentioned in the problem into 'dimensions', 'measurements', 'time', 'slicers', etc.`,
  `For every measure, determine whether it exists in the cube context, if it does, proceed directly to the next step, if not found, call the 'createIndicator' tool to create new calculated measure for it. After creating the measure, you need to call the subsequent steps to re-answer the complete answer.`,
  PROMPT_RETRIEVE_DIMENSION_MEMBER,
  CubeVariablePrompt,
  `If the time condition is a specified fixed time (such as 2023 year, 202202, 2020 Q1), please add it to 'slicers' according to the time dimension. If the time condition is relative (such as this month, last month, last year), please add it to 'timeSlicers'.`,
  `Then call 'answerQuestion' tool to answer question, use the complete conditions to answer`,
  `Then call 'giveMoreQuestions' tool to give more analysis suggestions`
)}

Disable parallel tool calls.
Answer using tools only.
`
        const system = await SystemMessagePromptTemplate.fromTemplate(systemTemplate, {
          templateFormat: 'mustache'
        }).format({ ...state, context: context() })
        return [new SystemMessage(system), ...state.messages]
      },
      toolsRouter: (state) => {
        const lastMessage = state.messages[state.messages.length - 1]
        if (isAIMessage(lastMessage)) {
          if (['giveMoreQuestions'].includes(lastMessage.name)) {
            return END
          }
        }
        return 'agent'
      }
    })
  }
}
