import { inject } from '@angular/core'
import { SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { CreateGraphOptions, createReactAgent } from '@metad/copilot'
import { NxStoryService } from '@metad/story/core'
import { NGXLogger } from 'ngx-logger'
import { pageAgentState } from './types'
import { injectCreatePageTools } from './tools'

export function injectCreatePageAgent() {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)
  const tools = injectCreatePageTools()

  return async ({ llm, interruptBefore, interruptAfter }: CreateGraphOptions) => {

    return createReactAgent({
      state: pageAgentState,
      llm,
      interruptBefore,
      interruptAfter,
      tools: [...tools],
      messageModifier: async (state) => {
        const systemTemplate = `You are a BI analysis expert.
{{role}}
{{language}}

Step 1. Create a new page in story dashboard. 
Step 2. 根据提供的 Cube context 和分析主题逐个向 dashboard 中添加 widgets.

Widget 类型分为 FilterBar, InputControl, Table, Chart, and KPI

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
