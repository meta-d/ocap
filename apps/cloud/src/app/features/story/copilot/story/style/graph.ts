import { inject } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { CreateGraphOptions, createReactAgent } from '@metad/copilot'
import { NGXLogger } from 'ngx-logger'
import { storyStyleAgentState } from './types'
import { injectModifyStyleTool } from './tools'

export function injectCreateStyleGraph() {
  // Default
  const router = inject(Router)
  const route = inject(ActivatedRoute)
  const logger = inject(NGXLogger)
  const modifyStyleTool = injectModifyStyleTool()

  const tools = [modifyStyleTool]

  return async ({ llm, checkpointer, interruptBefore, interruptAfter }: CreateGraphOptions) => {
    return createReactAgent({
      state: storyStyleAgentState,
      llm,
      interruptBefore,
      interruptAfter,
      checkpointSaver: checkpointer,
      tools: [...tools],
      messageModifier: async (state) => {
        const systemTemplate = `You are a BI analysis expert.
{{role}}
{{language}}
{{context}}

修改故事仪表板样式。
`

        const system = await SystemMessagePromptTemplate.fromTemplate(systemTemplate, {
          templateFormat: 'mustache'
        }).format(state)
        return [new SystemMessage(system), ...state.messages]
      }
    })
  }
}
