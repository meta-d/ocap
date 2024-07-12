import { SystemMessage } from '@langchain/core/messages'
import { CreateGraphOptions, createReactAgent } from '@metad/copilot'
import { injectCreateFormulaMeasureTool } from './tools'

export function injectCreateStoryGraph() {
  const tool = injectCreateFormulaMeasureTool()
  return async ({ llm, interruptBefore }: CreateGraphOptions) => {
    return createReactAgent({
      llm,
      tools: [tool],
      interruptBefore,
      messageModifier: async (state) => {
        return [
          new SystemMessage(`你是一名数据分析师。
${state.role}
${state.context}

Story dashbaord 通常由多个页面组成，每个页面是一个分析主题，每个主题的页面通常由一个过滤器栏、多个主要的维度输入控制器、多个指标、多个图形、一个或多个表格组成。
`),
          ...state.messages
        ]
      }
    })
  }
}
