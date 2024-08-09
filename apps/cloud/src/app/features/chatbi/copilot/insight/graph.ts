import { inject } from '@angular/core'
import { SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { CreateGraphOptions, createReactAgent } from '@metad/copilot'
import {
  createAgentStepsInstructions,
  injectDimensionMemberTool,
  makeCubeRulesPrompt,
  PROMPT_RETRIEVE_DIMENSION_MEMBER
} from '@metad/core'
import { ChatbiService } from '../../chatbi.service'
import { injectCreateChartTool, injectCreateFormulaTool } from '../tools'
import { insightAgentState } from './types'

export function injectCreateInsightGraph() {
  const chatbiService = inject(ChatbiService)
  const memberRetrieverTool = injectDimensionMemberTool()
  const createChartTool = injectCreateChartTool()
  const createFormulaTool = injectCreateFormulaTool()

  const context = chatbiService.context

  const tools = [memberRetrieverTool, createFormulaTool, createChartTool]
  return async ({ llm, checkpointer, interruptBefore, interruptAfter }: CreateGraphOptions) => {
    return createReactAgent({
      state: insightAgentState,
      llm,
      checkpointSaver: checkpointer,
      interruptBefore,
      interruptAfter,
      tools: [...tools],
      messageModifier: async (state) => {
        const systemTemplate = `You are a professional BI data analyst.
{{role}}
{{language}}
The cube context is:
{{context}}
Reference Documentations:
{{references}}

${makeCubeRulesPrompt()}
${PROMPT_RETRIEVE_DIMENSION_MEMBER}

If you add two or more measures to the chart, and the measures have different units, set the role of the measures with different units to different axes.

${createAgentStepsInstructions(
  `Extract the information mentioned in the problem into 'dimensions', 'measurements', 'time', 'slicers', etc.`,
  `Determine whether measure exists in the Cube information. If it does, proceed directly to the next step. If not found, call the 'createFormula' tool to create a calculated measure for that.`,
  PROMPT_RETRIEVE_DIMENSION_MEMBER,
  `If there are variables in the cube, please add the variables (Use variable name as dimension, defaultValueKey and defaultValueCaption as the default member) to the slicers in tool.`,
  `Add the time and slicers to slicers in tool`,
  `Final call 'answerQuestion' tool to answer question`
)}
`
        const system = await SystemMessagePromptTemplate.fromTemplate(systemTemplate, {
          templateFormat: 'mustache'
        }).format({ ...state, context: context() })
        return [new SystemMessage(system), ...state.messages]
      }
    })
  }
}
