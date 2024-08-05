import { inject } from '@angular/core'
import { SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { CreateGraphOptions, createReactAgent } from '@metad/copilot'
import { createAgentStepsInstructions, injectDimensionMemberTool, makeCubeRulesPrompt, PROMPT_RETRIEVE_DIMENSION_MEMBER } from '@metad/core'
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
        const systemTemplate = `你是一名专业的 BI 数据分析师。
{{role}}
{{language}}
{{context}}
Reference Documentations:
{{references}}

${makeCubeRulesPrompt()}
${PROMPT_RETRIEVE_DIMENSION_MEMBER}

${createAgentStepsInstructions(
  `拆分问题中提及的 ‘维度’ ‘度量’ ‘时间’ ‘限制条件’ 等信息`,
  `判断 measure 是否在 Cube 信息存在，如果存在则直接进行下一步，如果未找到则调用 'createFormula' tool 创建一个计算度量`,
  PROMPT_RETRIEVE_DIMENSION_MEMBER,
  `If there are variables in the cube, please add the variables (Use variable name as dimension, defaultValueKey and defaultValueCaption as the default member) to the slicers in tool.`,
  `Call 'answerQuestion' to answer question`
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
