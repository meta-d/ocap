import { inject } from '@angular/core'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { RunnableLambda } from '@langchain/core/runnables'
import { CreateGraphOptions, createReactAgent } from '@metad/copilot'
import { injectDimensionMemberTool, makeCubeRulesPrompt, PROMPT_RETRIEVE_DIMENSION_MEMBER } from '@metad/core'
import { NxStoryService } from '@metad/story/core'
import { NGXLogger } from 'ngx-logger'
import { injectCreateChartTool, injectCreateTableTool } from '../tools'
import { WidgetAgentState, widgetAgentState } from './types'

export function injectCreateWidgetGraph() {
  const logger = inject(NGXLogger)
  const storyService = inject(NxStoryService)
  const defaultModelCubePrompt = storyService.defaultModelCubePrompt

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
        console.log(state.context)
        const system = await SystemMessagePromptTemplate.fromTemplate(systemTemplate, {
          templateFormat: 'mustache'
        }).format({...state, context: state.context || defaultModelCubePrompt() })
        return [new SystemMessage(system), ...state.messages]
      }
    })
  }
}

export function injectCreateWidgetAgent() {
  const logger = inject(NGXLogger)
  const createAgent = injectCreateWidgetGraph()

  return async ({ llm }: CreateGraphOptions) => {
    const agent = await createAgent({ llm })
    return RunnableLambda.from(async (state: WidgetAgentState) => {
      const { messages } = await agent.invoke({
        input: state.input,
        messages: [new HumanMessage(state.input)],
        role: state.role,
        language: state.language,
        context: state.context
      })

      return messages
    })
  }
}
