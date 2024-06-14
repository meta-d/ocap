import { BaseMessage } from '@langchain/core/messages'
import { Runnable } from '@langchain/core/runnables'
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { ChatOpenAI } from '@langchain/openai'
import { CubeModelerName } from '../cube/graph'
import { DimensionModelerName } from '../dimension/graph'
import { runAgentNode } from '../langgraph-helper-utilities'
import { createSupervisor } from './supervisor'

// Define the top-level State interface
interface State {
  messages: BaseMessage[]
  next: string
  instructions: string
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
  }
}

export async function createModelerGraph(llm: ChatOpenAI, dimensionModeler: Runnable, cubeModeler: Runnable) {
  const supervisorNode = await createSupervisor(llm)

  const superGraph = new StateGraph({
    channels: superState
  })
    .addNode(DimensionModelerName, (state: State, options) => {
      return runAgentNode({ state, agent: dimensionModeler, name: DimensionModelerName, config: options.config })
    })
    .addNode(CubeModelerName, (state: State, options) => {
      return runAgentNode({ state, agent: cubeModeler, name: CubeModelerName, config: options.config })
    })
    .addNode('supervisor', supervisorNode as unknown)

  superGraph.addEdge(DimensionModelerName, 'supervisor')
  superGraph.addEdge(CubeModelerName, 'supervisor')
  superGraph.addConditionalEdges('supervisor', (x) => x.next, {
    [DimensionModelerName]: DimensionModelerName,
    [CubeModelerName]: CubeModelerName,
    FINISH: END
  })

  superGraph.addEdge(START, 'supervisor')
  const compiledSuperGraph = superGraph.compile()

  return compiledSuperGraph
}
