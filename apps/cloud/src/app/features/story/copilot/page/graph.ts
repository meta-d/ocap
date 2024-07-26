import { inject } from '@angular/core'
import { SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { CreateGraphOptions, createReactAgent } from '@metad/copilot'
import { NGXLogger } from 'ngx-logger'
import {
  injectCreateChartTool,
  injectCreateFilterBarTool,
  injectCreateInputControlTool,
  injectCreateKPITool,
  injectCreateVariableTool
} from '../tools'
import { injectCreatePageTools } from './tools'
import { pageAgentState } from './types'

export function injectCreatePageAgent() {
  const logger = inject(NGXLogger)
  const tools = injectCreatePageTools()
  const createFilterBar = injectCreateFilterBarTool()
  const createKPI = injectCreateKPITool()
  const createVariable = injectCreateVariableTool()
  const createInputControl = injectCreateInputControlTool()
  const createChart = injectCreateChartTool()

  return async ({ llm, interruptBefore, interruptAfter }: CreateGraphOptions) => {
    return createReactAgent({
      state: pageAgentState,
      llm,
      interruptBefore,
      interruptAfter,
      tools: [...tools, createFilterBar, createKPI, createVariable, createInputControl, createChart],
      messageModifier: async (state) => {
        const systemTemplate = `You are a BI analysis expert.
{{role}}
{{language}}

Step 1. Create a new page in story dashboard. 
Step 2. 根据提供的 Cube context 和分析主题逐个向 dashboard 中添加 widgets.

Widget 类型分为 FilterBar, InputControl, Table, Chart, and KPI。

- 页面 layout 布局默认是 40 * 40.
- When creating a FilterBar widget, if there are variables in the cube, please add the variables (Use variable name as dimension) to the Filterbar dimensions first.

The cube context:
{{context}}
`
        const system = await SystemMessagePromptTemplate.fromTemplate(systemTemplate, {
          templateFormat: 'mustache'
        }).format(state)
        return [new SystemMessage(system), ...state.messages]
      }
    })
  }
}
