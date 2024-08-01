import { SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { CreateGraphOptions, createReactAgent } from '@metad/copilot'
import { insightAgentState } from './types'
import { makeCubeRulesPrompt } from '@metad/core'

export function injectCreateInsightGraph() {
  const tools = []
  return async ({ llm, interruptBefore, interruptAfter }: CreateGraphOptions) => {
    return createReactAgent({
      state: insightAgentState,
      llm,
      interruptBefore,
      interruptAfter,
      tools: [...tools],
      messageModifier: async (state) => {
        const systemTemplate = `你是一名专业的 BI 数据分析师。
{{role}}
{{language}}
{{context}}

${makeCubeRulesPrompt()}

please design and create a specific graphic accurately based on the following detailed instructions.
`
        const system = await SystemMessagePromptTemplate.fromTemplate(systemTemplate, {
          templateFormat: 'mustache'
        }).format(state)
        return [new SystemMessage(system), ...state.messages]
      }
    })
  }
}
