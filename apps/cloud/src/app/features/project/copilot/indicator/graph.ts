import { Signal, computed, inject } from '@angular/core'
import { HumanMessage } from '@langchain/core/messages'
import { RunnableLambda } from '@langchain/core/runnables'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { CreateGraphOptions } from '@metad/copilot'
import { AgentState } from '@metad/copilot-angular'
import { injectDimensionMemberTool } from '@metad/core'
import { IBusinessArea, ITag } from '../../../../@core'
import { Route, Team, injectAgentFewShotTemplate } from '../../../../@core/copilot/'
import { ProjectService } from '../../project.service'
import { createIndicatorWorker } from './indicator-agent'
import { injectCreateFormulaTool, injectCreateIndicatorTool, injectPickCubeTool } from './tools'
import { INDICATOR_AGENT_NAME, IndicatorCommandName, SUPERVISOR_NAME } from './types'

// Define the top-level State interface
interface State extends Route.State {}

const superState: StateGraphArgs<State>['channels'] = Route.createState()

export async function createIndicatorGraph({
  llm,
  checkpointer,
  pickCubeTool,
  createIndicatorTool,
  memberRetrieverTool,
  createFormulaTool,
  indicatorCodes,
  businessAreas,
  tags
}: CreateGraphOptions & {
  pickCubeTool?: DynamicStructuredTool
  createIndicatorTool?: DynamicStructuredTool
  memberRetrieverTool?: DynamicStructuredTool
  createFormulaTool?: DynamicStructuredTool
  indicatorCodes: Signal<string[]>
  businessAreas: Signal<IBusinessArea[]>
  tags: Signal<ITag[]>
}) {
  const supervisorNode = await Team.createSupervisor(llm, [INDICATOR_AGENT_NAME])

  const createIndicator = await createIndicatorWorker(
    {
      llm,
      indicatorCodes,
      businessAreas,
      tags
    },
    [pickCubeTool, memberRetrieverTool, createFormulaTool, createIndicatorTool]
  )

  const superGraph = new StateGraph({ channels: superState })
    // Add steps nodes
    .addNode(SUPERVISOR_NAME, supervisorNode)
    .addNode(INDICATOR_AGENT_NAME, Route.createRunWorkerAgent(createIndicator, INDICATOR_AGENT_NAME))

  superGraph.addEdge(INDICATOR_AGENT_NAME, SUPERVISOR_NAME)
  superGraph.addConditionalEdges(SUPERVISOR_NAME, (x) => x.next)

  superGraph.addEdge(START, SUPERVISOR_NAME)

  return superGraph.compile({ checkpointer })
}

export function injectCreateIndicatorGraph() {
  const projectService = inject(ProjectService)
  const createIndicatorTool = injectCreateIndicatorTool()
  const pickCubeTool = injectPickCubeTool()
  const memberRetrieverTool = injectDimensionMemberTool()
  const createFormulaTool = injectCreateFormulaTool()

  const indicatorCodes = computed(() => projectService.indicators()?.map((indicator) => indicator.code) ?? [])
  const businessAreas = projectService.businessAreas
  const tags = projectService.tags

  return async ({ llm, checkpointer }: CreateGraphOptions) => {
    return createIndicatorGraph({
      llm,
      checkpointer,
      pickCubeTool,
      createIndicatorTool,
      memberRetrieverTool,
      createFormulaTool,
      indicatorCodes,
      businessAreas,
      tags
    })
  }
}

export function injectRunIndicatorAgent() {
  const createIndicatorGraph = injectCreateIndicatorGraph()
  const fewShotPrompt = injectAgentFewShotTemplate(IndicatorCommandName, { k: 1, vectorStore: null })

  return async ({ llm, checkpointer }: CreateGraphOptions) => {
    const agent = await createIndicatorGraph({ llm })

    return RunnableLambda.from(async (state: AgentState) => {
      const content = await fewShotPrompt.format({ input: state.input, context: state.context })
      return {
        input: state.input,
        messages: [new HumanMessage(content)],
        role: state.role,
        context: state.context
      }
    }).pipe(agent)
  }
}
