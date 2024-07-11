import { SystemMessage } from '@langchain/core/messages'
import { StateGraphArgs } from '@langchain/langgraph/web'
import { CreateGraphOptions, createReactAgent, Team } from '@metad/copilot'
import { injectCreateChartTool } from './tools'
import { Signal } from '@angular/core'

// Define the top-level State interface
interface State extends Team.State {
  indicator: string
}

const superState: StateGraphArgs<State>['channels'] = {
  ...Team.createState(),
  indicator: {
    value: (x: string, y?: string) => y ?? x,
    default: () => ''
  }
}

export function injectCreateChartGraph(logic: Signal<string>, createChart: (chart: {logic: string}) => Promise<string>) {
  const createChartTool = injectCreateChartTool(createChart)

  return async ({ llm, checkpointer, interruptBefore, interruptAfter }: CreateGraphOptions) => {
    return createReactAgent({
      llm,
      checkpointSaver: checkpointer,
      interruptBefore,
      interruptAfter,
      tools: [createChartTool],
      state: superState,
      messageModifier: async (state) => {
        const system = `You are a javascript programmer. Follow the prompts to write or edit a Javascript function using the ECharts library to create a custom chart.
${state.role}
${state.context}
函数应该接受以下参数：
1. 'queryResult': The type of queryResult is
\`\`\`
{
  status: 'OK',
  data: any[],
  schema: {
    rows?: {
      name: string,
      label?: string
      dataType: string
    }[],
    columns: {
      name: string,
      label?: string
      dataType: string
    }[]
  }
}
\`\`\`
2. 'chartAnnotation':

3. 'entityType':

4. 'locale': 语言环境代码
5. 'chartsInstance': ECharts 实例
6. 'utils': 工具函数集
。
自定义逻辑需要返回结果类型为：
\`\`\`
{
  options: ECharts 图形的 Option 配置对象
  onClick: 图形点击事件的响应函数，返回事件和相关切片器
}
\`\`\`

Current function logic is:
${logic() ? logic() : 'empty'}
`
        return [new SystemMessage(system), ...state.messages]
      }
    })
  }
}
