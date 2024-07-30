import { inject } from '@angular/core'
import { SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { CreateGraphOptions, createReactAgent } from '@metad/copilot'
import { makeCubeRulesPrompt } from '@metad/core'
import { ChatbiService } from '../../chatbi.service'
import { injectCreateChartTool } from '../tools'
import { insightAgentState } from './types'

export function injectCreateInsightGraph() {
  const chatbiService = inject(ChatbiService)
  const createChartTool = injectCreateChartTool()

  const context = chatbiService.context

  const tools = [createChartTool]
  return async ({ llm, checkpointer, interruptBefore, interruptAfter }: CreateGraphOptions) => {
    return createReactAgent({
      state: insightAgentState,
      llm,
      checkpointSaver: checkpointer,
      interruptBefore,
      interruptAfter,
      tools: [...tools],
      messageModifier: async (state) => {
        const systemTemplate = `你是一名专业的 BI 数据分析师。
{{role}}
{{language}}
{{context}}

${makeCubeRulesPrompt()}

If there are variables in the cube, please add the variables (Use variable name as dimension, defaultValueKey and defaultValueCaption as the default member) to the slicers in tool.

please call tool to answer question accurately based on the following detailed instructions.
`
        const system = await SystemMessagePromptTemplate.fromTemplate(systemTemplate, {
          templateFormat: 'mustache'
        }).format({ ...state, context: context() })
        return [new SystemMessage(system), ...state.messages]
      }
    })
  }
}
