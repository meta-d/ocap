import { Signal } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { CreateGraphOptions } from '@metad/copilot'
import { IBusinessArea, ITag } from '../../../../@core'
import { Route, Team } from '../../../../@core/copilot/'
import { createIndicatorWorker } from './indicator-agent'
import { INDICATOR_AGENT_NAME, SUPERVISOR_NAME } from './types'

// Define the top-level State interface
interface State extends Route.State {
}

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

  return superGraph
}
