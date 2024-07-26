import { inject } from '@angular/core'
import { SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { CreateGraphOptions, createReactAgent } from '@metad/copilot'
import { NGXLogger } from 'ngx-logger'
import { pageAgentState } from './types'
import { injectCreatePageTools } from './tools'
import { injectCreateFilterBarTool, injectCreateKPITool, injectCreateVariableTool } from '../tools'

export function injectCreatePageAgent() {
  const logger = inject(NGXLogger)
  const tools = injectCreatePageTools()
  const createFilterBar = injectCreateFilterBarTool()
  const createKPI = injectCreateKPITool()
  const createVariable = injectCreateVariableTool()

  return async ({ llm, interruptBefore, interruptAfter }: CreateGraphOptions) => {

    return createReactAgent({
      state: pageAgentState,
      llm,
      interruptBefore,
      interruptAfter,
      tools: [...tools, createFilterBar, createKPI, createVariable],
      messageModifier: async (state) => {
        const systemTemplate = `You are a BI analysis expert.
{{role}}
{{language}}

Step 1. Create a new page in story dashboard. 
Step 2. 根据提供的 Cube context 和分析主题逐个向 dashboard 中添加 widgets.

Widget 类型分为 FilterBar, InputControl, Table, Chart, and KPI。

- 页面 layout 布局默认是 40 * 40.
- If there are variables in the cube, be sure to call 'createVariableControl' to create an input control widget for each variable to control the input value.

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
