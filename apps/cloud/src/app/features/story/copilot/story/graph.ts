import { inject, signal } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { HumanMessage } from '@langchain/core/messages'
import { RunnableLambda } from '@langchain/core/runnables'
import { START, StateGraph } from '@langchain/langgraph/web'
import { CreateGraphOptions, Team } from '@metad/copilot'
import { DataSettings } from '@metad/ocap-core'
import { injectCreateWidgetAgent } from '@metad/story/story'
import { NGXLogger } from 'ngx-logger'
import { injectCreateCalculationGraph } from '../calculation'
import { injectCreatePageAgent } from '../page'
import { StoryAgentState, storyAgentState } from './types'

export function injectCreateStoryGraph() {
  // Default
  const defaultDataSettings = signal<DataSettings & { modelId: string }>(null)
  const router = inject(Router)
  const route = inject(ActivatedRoute)
  const logger = inject(NGXLogger)

  const createCalculationGraph = injectCreateCalculationGraph(
    defaultDataSettings,
    (dataSettings: DataSettings, key: string) => {
      logger.debug(
        `Created calculation '${key}' for dataSource '${dataSettings.dataSource}' entity '${dataSettings.entitySet}'`
      )
      router.navigate(['calculations', encodeURIComponent(dataSettings.entitySet), key], { relativeTo: route })
    }
  )

  const createPageAgent = injectCreatePageAgent()
  const createWidgetGraph = injectCreateWidgetAgent()

  return async ({ llm, checkpointer, interruptBefore, interruptAfter }: CreateGraphOptions) => {
    const calculationAgent = (await createCalculationGraph({ llm })).compile()
    const pageAgent = await createPageAgent({ llm })

    const superAgent = await Team.createSupervisorAgent(
      llm,
      [
        {
          name: 'calcualtion',
          description: 'create a calculation measure for cube'
        },
        {
          name: 'page',
          description: ''
        },
        {
          name: 'widget',
          description: 'create a widget in story dashboard'
        }
      ],
      [],
      `你是一名数据分析师。
{role}
{language}
{context}

Story dashbaord 通常由多个页面组成，每个页面是一个分析主题，每个主题的页面通常由一个过滤器栏、多个主要的维度输入控制器、多个指标、多个图形、一个或多个表格组成。
- 过滤器栏通常包含 3 至 8 个重要的维度过滤器，不要太多。
`,
      `If you need to execute a task, you need to get confirmation before calling the route function.`
    )

    const widgetAgent = await createWidgetGraph({ llm })

    const superGraph = new StateGraph({ channels: storyAgentState })
      // Add steps nodes
      .addNode(
        Team.SUPERVISOR_NAME,
        new RunnableLambda({ func: superAgent }).withConfig({ runName: Team.SUPERVISOR_NAME })
      )
      .addNode(
        'calculation',
        RunnableLambda.from(async (state: StoryAgentState) => {
          const { messages } = await calculationAgent.invoke({
            input: state.instructions,
            messages: [new HumanMessage(state.instructions)],
            role: state.role,
            context: state.context,
            language: state.language
          })
          return Team.responseToolMessage(state.tool_call_id, messages)
        })
      )
      .addNode(
        'page',
        RunnableLambda.from(async (state: StoryAgentState) => {
          const messages = await pageAgent.invoke({
            input: state.instructions,
            role: state.role,
            context: state.context,
            language: state.language,
            messages: []
          })

          return Team.responseToolMessage(state.tool_call_id, messages)
        })
      )
      .addNode(
        'widget',
        RunnableLambda.from(async (state: StoryAgentState) => {
          const { messages } = await widgetAgent.invoke({
            input: state.input,
            messages: [new HumanMessage(state.instructions)],
            role: state.role,
            context: state.context
          })

          return Team.responseToolMessage(state.tool_call_id, messages)
        })
      )
      .addEdge('calculation', Team.SUPERVISOR_NAME)
      .addEdge('page', Team.SUPERVISOR_NAME)
      .addEdge('widget', Team.SUPERVISOR_NAME)
      .addConditionalEdges(Team.SUPERVISOR_NAME, Team.supervisorRouter)
      .addEdge(START, Team.SUPERVISOR_NAME)

    return superGraph
  }
}
