import { Signal } from '@angular/core'
import { BaseMessage } from '@langchain/core/messages'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { CreateGraphOptions } from '@metad/copilot'
import { IBusinessArea, ITag } from '../../../../@core'
import { Route, Team } from '../../../../@core/copilot/'
import { createIndicatorWorker } from './indicator-agent'
import { createReviewerWorker } from './reviewer-agent'
import { FORMULA_REVIEWER_AGENT_NAME, INDICATOR_AGENT_NAME, SUPERVISOR_NAME } from './types'

// Define the top-level State interface
interface State extends Route.State {
  instructions?: string
}

const superState: StateGraphArgs<State>['channels'] = {
  role: {
    value: (x: any, y: any) => y ?? x,
    default: () => ''
  },
  context: {
    value: (x: any, y: any) => y ?? x,
    default: () => ''
  },
  messages: {
    value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: () => []
  },
  next: {
    value: (x: string, y?: string) => y ?? x,
    default: () => 'ResearchTeam'
  },
  instructions: {
    value: (x: string, y?: string) => y ?? x,
    default: () => "Resolve the user's request."
  }
}

export async function createIndicatorGraph({
  llm,
  checkpointer,
  pickCubeTool,
  createIndicatorTool,
  memberRetrieverTool,
  reviseFormulaTool,
  copilotRoleContext,
  indicatorCodes,
  businessAreas,
  tags
}: CreateGraphOptions & {
  pickCubeTool?: DynamicStructuredTool
  createIndicatorTool?: DynamicStructuredTool
  memberRetrieverTool?: DynamicStructuredTool
  reviseFormulaTool?: DynamicStructuredTool
  copilotRoleContext: () => string
  indicatorCodes: Signal<string[]>
  businessAreas: Signal<IBusinessArea[]>
  tags: Signal<ITag[]>
}) {
  const supervisorNode = await Team.createSupervisor(
    llm,
    [INDICATOR_AGENT_NAME, FORMULA_REVIEWER_AGENT_NAME],
    `If the new indicator has a formula, please use '${FORMULA_REVIEWER_AGENT_NAME}' to check the correctness of the formula, otherwise just end it`
  )

  const createIndicator = await createIndicatorWorker(
    {
      llm,
      copilotRoleContext,
      indicatorCodes,
      businessAreas,
      tags
    },
    [pickCubeTool, memberRetrieverTool, createIndicatorTool]
  )

  const reviewerWorker = await createReviewerWorker({
    llm,
    copilotRoleContext,
    tools: [reviseFormulaTool]
  })

  const superGraph = new StateGraph({ channels: superState })
    // Add steps nodes
    .addNode(SUPERVISOR_NAME, supervisorNode)
    .addNode(INDICATOR_AGENT_NAME, Route.createRunWorkerAgent(createIndicator, INDICATOR_AGENT_NAME))
    .addNode(FORMULA_REVIEWER_AGENT_NAME, Team.getInstructions.pipe(Route.createRunWorkerAgent(reviewerWorker, FORMULA_REVIEWER_AGENT_NAME)))

  superGraph.addEdge(INDICATOR_AGENT_NAME, SUPERVISOR_NAME)
  superGraph.addEdge(FORMULA_REVIEWER_AGENT_NAME, SUPERVISOR_NAME)
  superGraph.addConditionalEdges(SUPERVISOR_NAME, (x) => x.next)

  superGraph.addEdge(START, SUPERVISOR_NAME)

  return superGraph
}
