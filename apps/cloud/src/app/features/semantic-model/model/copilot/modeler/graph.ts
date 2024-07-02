import { RunnableLambda } from '@langchain/core/runnables'
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { CreateGraphOptions } from '@metad/copilot'
import { Team } from 'apps/cloud/src/app/@core/copilot'
import { CUBE_MODELER_NAME, injectRunCubeModeler } from '../cube'
import { DIMENSION_MODELER_NAME, injectRunDimensionModeler } from '../dimension/'
import { injectRunModelerPlanner } from './planner'
import { createSupervisor } from './supervisor'
import { PLANNER_NAME, SUPERVISOR_NAME, State } from './types'

const superState: StateGraphArgs<State>['channels'] = {
  ...Team.createState(),
  plan: {
    value: (x?: string[], y?: string[]) => y ?? x ?? [],
    default: () => []
  }
}

export function injectCreateModelerGraph() {
  const createModelerPlanner = injectRunModelerPlanner()
  const createDimensionModeler = injectRunDimensionModeler()
  const createCubeModeler = injectRunCubeModeler()

  return async ({ llm }: CreateGraphOptions) => {
    const supervisorNode = await createSupervisor(llm, [PLANNER_NAME, DIMENSION_MODELER_NAME, CUBE_MODELER_NAME])

    const superGraph = new StateGraph({ channels: superState })
      // Add steps nodes
      .addNode(PLANNER_NAME, await createModelerPlanner({ llm }))
      .addNode(
        DIMENSION_MODELER_NAME,
        RunnableLambda.from(async (state: State) => {
          return {
            input: state.instructions,
            role: state.role,
            context: state.context
          }
        }).pipe(await createDimensionModeler({ llm }))
      )
      .addNode(
        CUBE_MODELER_NAME,
        RunnableLambda.from(async (state: State) => {
          return {
            input: state.instructions,
            role: state.role,
            context: state.context
          }
        }).pipe(await createCubeModeler({ llm }))
      )
      .addNode(SUPERVISOR_NAME, supervisorNode)

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

    return superGraph
  }
}
