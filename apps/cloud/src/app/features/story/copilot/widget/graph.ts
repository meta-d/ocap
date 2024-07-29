import { computed, inject, signal } from '@angular/core'
import { SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { CreateGraphOptions, createReactAgent } from '@metad/copilot'
import { injectDimensionMemberTool, makeCubeRulesPrompt, PROMPT_RETRIEVE_DIMENSION_MEMBER } from '@metad/core'
import { NxStoryService } from '@metad/story/core'
import { NGXLogger } from 'ngx-logger'
import { widgetAgentState } from './types'
import { injectCreateChartTool, injectCreateTableTool } from '../tools'

export function injectCreateWidgetGraph() {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)

  const memberRetrieverTool = injectDimensionMemberTool()

  const createTableTool = injectCreateTableTool()
  const createChartTool = injectCreateChartTool()

  return async ({ llm, interruptBefore, interruptAfter }: CreateGraphOptions) => {
    return createReactAgent({
      state: widgetAgentState,
      llm,
      interruptBefore,
      interruptAfter,
      tools: [memberRetrieverTool, createTableTool, createChartTool],
      messageModifier: async (state) => {
        const systemTemplate = `You are a BI analysis expert. Please use MDX technology to edit or create chart widget configurations based on Cube information.
{{role}}
{{language}}
${makeCubeRulesPrompt()}

${PROMPT_RETRIEVE_DIMENSION_MEMBER}
A dimension can only be used once, and a hierarchy cannot appear on multiple independent axes.

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
