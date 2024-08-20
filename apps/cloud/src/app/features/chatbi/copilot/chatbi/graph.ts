import { inject } from '@angular/core'
import { SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
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
import { injectCreateChartTool, injectCreateFormulaTool } from '../tools'
import { CHATBI_COMMAND_NAME, insightAgentState } from './types'

export function injectCreateInsightGraph() {
  const chatbiService = inject(ChatbiService)
  const memberRetrieverTool = injectDimensionMemberTool()
  const createChartTool = injectCreateChartTool()
  const createFormulaTool = injectCreateFormulaTool()
  const referencesRetrieverTool = injectReferencesRetrieverTool(
    [referencesCommandName(CHATBI_COMMAND_NAME), referencesCommandName('calculated')],
    { k: 3 }
  )

  const context = chatbiService.context

  const tools = [referencesRetrieverTool, memberRetrieverTool, createFormulaTool, createChartTool]
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

Reference Documentations:
{{references}}

The cube context is:
{{context}}

${makeCubeRulesPrompt()}
${PROMPT_RETRIEVE_DIMENSION_MEMBER}

If you have any questions about how to analysis data (such as 'how to create a formula of calculated measure', 'how to create a time slicer about relative time'), please call 'referencesRetriever' tool to get the reference documentations.

${createAgentStepsInstructions(
  `Extract the information mentioned in the problem into 'dimensions', 'measurements', 'time', 'slicers', etc.`,
  `Determine whether measure exists in the Cube information. If it does, proceed directly to the next step. If not found, call the 'createFormula' tool to create a indicator for that. After creating the indicator, you need to call the subsequent steps to re-answer the complete answer.`,
  PROMPT_RETRIEVE_DIMENSION_MEMBER,
  CubeVariablePrompt,
  `Add the time and slicers to slicers in tool, if the measure to be displayed is time-related, add the current period as a filter to the 'timeSlicers'.`,
  `Final call 'answerQuestion' tool to answer question, use the complete conditions to answer`
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
