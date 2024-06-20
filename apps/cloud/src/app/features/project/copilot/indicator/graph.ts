import { Signal } from '@angular/core'
import { BaseMessage } from '@langchain/core/messages'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { ChatOpenAI } from '@langchain/openai'
import { Route } from '../../../../@core/copilot/'
import { INDICATOR_WORKER_NAME, SUPERVISOR_NAME } from './types'

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
  copilotRoleContext,
  indicatorCodes
}: {
  llm: ChatOpenAI
  pickCubeTool?: DynamicStructuredTool
  createIndicatorTool?: DynamicStructuredTool
  copilotRoleContext: () => string
  indicatorCodes: Signal<string[]>
}) {
  const supervisorNode = await Route.createSupervisor(llm, [INDICATOR_WORKER_NAME])
  // const planner = await Route.createWorkerAgent(llm, [pickCubeTool], `为注册业务数据指标指定计划\n` + `{context}`)
  const createIndicator = await createIndicatorWorker({
    llm,
    createIndicatorTool,
    pickCubeTool,
    copilotRoleContext,
    indicatorCodes
  })

  const superGraph = new StateGraph({ channels: superState })
    // Add steps nodes
    .addNode(SUPERVISOR_NAME, supervisorNode)
    // .addNode(PLANNER_NAME, Route.createRunWorkerAgent(planner, PLANNER_NAME))
    .addNode(INDICATOR_WORKER_NAME, Route.createRunWorkerAgent(createIndicator, INDICATOR_WORKER_NAME))

  // superGraph.addEdge(PLANNER_NAME, SUPERVISOR_NAME)
  superGraph.addEdge(INDICATOR_WORKER_NAME, SUPERVISOR_NAME)
  superGraph.addConditionalEdges(SUPERVISOR_NAME, (x) => x.next)

  superGraph.addEdge(START, SUPERVISOR_NAME)

  return superGraph
}

async function createIndicatorWorker({ llm, createIndicatorTool, pickCubeTool, copilotRoleContext, indicatorCodes }) {
  const systemPrompt =
    `你是一名 BI 指标体系管理的业务专家，请根据指定的 Cube 信息和需求描述转成相应的参数调用 createIndicator tool 进行创建新指标。` +
    `\n{role}\n` +
    `code 不能与以下已有的重复：[${indicatorCodes().join(', ')}]\n` +
    `将未限定成员的可以自由选择的维度都加入到 dimensions 中，选择一个 calendar 维度加入到 calendar 中，将必要的限定成员加入到 filters 属性中。` +
    `如果未提供 Cube 信息或者需要重新选择 Cube 时请调用 'pickCube' tool 获取 Cube 信息。`
  return await Route.createWorkerAgent(llm, [pickCubeTool, createIndicatorTool], systemPrompt, {
    role: copilotRoleContext
  })
}
