import { Signal } from '@angular/core'
import { BaseMessage } from '@langchain/core/messages'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { ChatOpenAI } from '@langchain/openai'
import { Route } from '../../../../@core/copilot/'
import { createIndicatorWorker } from './indicator-agent'
import { createMemberWorker } from './member-agent'
import { DIMENSION_AGENT_NAME, INDICATOR_AGENT_NAME, SUPERVISOR_NAME } from './types'

// Define the top-level State interface
interface State extends Route.IState {
  next: string
  instructions: string
}

const superState: StateGraphArgs<State>['channels'] = {
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
  pickCubeTool,
  createIndicatorTool,
  memberRetrieverTool,
  copilotRoleContext,
  indicatorCodes
}: {
  llm: ChatOpenAI
  pickCubeTool?: DynamicStructuredTool
  createIndicatorTool?: DynamicStructuredTool
  memberRetrieverTool?: DynamicStructuredTool
  copilotRoleContext: () => string
  indicatorCodes: Signal<string[]>
}) {
  const supervisorNode = await Route.createSupervisor(llm, [INDICATOR_AGENT_NAME])
  // const planner = await Route.createWorkerAgent(llm, [pickCubeTool], `为注册业务数据指标指定计划\n` + `{context}`)
  // const memberWorker = await createMemberWorker({
  //   llm,
  //   memberRetrieverTool,
  //   copilotRoleContext
  // })
  const createIndicator = await createIndicatorWorker({
    llm,
    copilotRoleContext,
    indicatorCodes
  }, [pickCubeTool, memberRetrieverTool, createIndicatorTool])

  const superGraph = new StateGraph({ channels: superState })
    // Add steps nodes
    .addNode(SUPERVISOR_NAME, supervisorNode)
    // .addNode(DIMENSION_AGENT_NAME, Route.createRunWorkerAgent(memberWorker, DIMENSION_AGENT_NAME))
    .addNode(INDICATOR_AGENT_NAME, Route.createRunWorkerAgent(createIndicator, INDICATOR_AGENT_NAME))

  // superGraph.addEdge(DIMENSION_AGENT_NAME, SUPERVISOR_NAME)
  superGraph.addEdge(INDICATOR_AGENT_NAME, SUPERVISOR_NAME)
  superGraph.addConditionalEdges(SUPERVISOR_NAME, (x) => x.next)

  superGraph.addEdge(START, SUPERVISOR_NAME)

  return superGraph
}
