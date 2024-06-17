import { BaseMessage } from '@langchain/core/messages'
import { Runnable } from '@langchain/core/runnables'
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { ChatOpenAI } from '@langchain/openai'
import { CUBE_MODELER_NAME } from '../cube/graph'
import { DIMENSION_MODELER_NAME } from '../dimension/graph'
import { runAgentNode } from '../langgraph-helper-utilities'
import { createPlannerAgent } from './planner'
import { createSupervisor } from './supervisor'
import { PLANNER_NAME, SUPERVISOR_NAME } from './types'

// Define the top-level State interface
interface State {
  messages: BaseMessage[]
  next: string
  instructions: string
  plan: string[]
  pastSteps: [string, string][]
}

const superState: StateGraphArgs<State>['channels'] = {
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
  },
  plan: {
    value: (x?: string[], y?: string[]) => y ?? x ?? [],
    default: () => []
  },
  pastSteps: {
    value: (x: [string, string][], y: [string, string][]) => x.concat(y),
    default: () => []
  }
}



export async function createModelerGraph(llm: ChatOpenAI, dimensionModeler: Runnable, cubeModeler: Runnable) {
  const supervisorNode = await createSupervisor(llm, [PLANNER_NAME, DIMENSION_MODELER_NAME, CUBE_MODELER_NAME])
  const planner = await createPlannerAgent(llm)

  async function runPlanner(state: State): Promise<any> {
    const plan = await planner.invoke({ objective: state.messages.map((m) => m.content).join('\n') })
    return { plan: plan.steps }
  }

  const superGraph = new StateGraph({ channels: superState })
    // Add steps nodes
    .addNode(PLANNER_NAME, runPlanner)
    .addNode(DIMENSION_MODELER_NAME, (state: State, options) => {
      return runAgentNode<State>({ state, agent: dimensionModeler, name: DIMENSION_MODELER_NAME, config: options.config })
    })
    .addNode(CUBE_MODELER_NAME, (state: State, options) => {
      return runAgentNode<State>({ state, agent: cubeModeler, name: CUBE_MODELER_NAME, config: options.config })
    })
    .addNode(SUPERVISOR_NAME, supervisorNode as unknown)

  superGraph.addEdge(PLANNER_NAME, SUPERVISOR_NAME)
  superGraph.addEdge(DIMENSION_MODELER_NAME, SUPERVISOR_NAME)
  superGraph.addEdge(CUBE_MODELER_NAME, SUPERVISOR_NAME)
  superGraph.addConditionalEdges(SUPERVISOR_NAME, (x) => x.next, {
    [PLANNER_NAME]: PLANNER_NAME,
    [DIMENSION_MODELER_NAME]: DIMENSION_MODELER_NAME,
    [CUBE_MODELER_NAME]: CUBE_MODELER_NAME,
    FINISH: END
  })

  superGraph.addEdge(START, SUPERVISOR_NAME)
  const compiledSuperGraph = superGraph.compile()

  return compiledSuperGraph
}
