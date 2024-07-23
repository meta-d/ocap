import { inject } from '@angular/core'
import { RunnableLambda } from '@langchain/core/runnables'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { CreateGraphOptions, Team } from '@metad/copilot'
import { SemanticModelService } from '../../model.service'
import { CUBE_MODELER_NAME, injectRunCubeModeler } from '../cube'
import { DIMENSION_MODELER_NAME, injectRunDimensionModeler } from '../dimension/'
import { injectQueryTablesTool, injectSelectTablesTool } from '../tools'
import { injectRunModelerPlanner } from './planner'
import { createSupervisorAgent } from './supervisor'
import { ModelerState } from './types'

const superState: StateGraphArgs<ModelerState>['channels'] = {
  ...Team.createState(),
}

export function injectCreateModelerGraph() {
  const modelService = inject(SemanticModelService)
  const createModelerPlanner = injectRunModelerPlanner()
  const createDimensionModeler = injectRunDimensionModeler()
  const createCubeModeler = injectRunCubeModeler()
  const selectTablesTool = injectSelectTablesTool()
  const queryTablesTool = injectQueryTablesTool()

  const dimensions = modelService.dimensions

  return async ({ llm }: CreateGraphOptions) => {
    const tools = [selectTablesTool, queryTablesTool]
    const supervisorAgent = await createSupervisorAgent({ llm, dimensions, tools })
    const dimensionAgent = await createDimensionModeler({ llm })
    const cubeAgent = await createCubeModeler({ llm })

    // const supervisorNode = await createSupervisor(llm, [
    //   {
    //     name: PLANNER_NAME,
    //     description: 'Create a plan for modeling'
    //   },
    //   {
    //     name: DIMENSION_MODELER_NAME,
    //     description: 'Create a dimension, only one at a time'
    //   },
    //   {
    //     name: CUBE_MODELER_NAME,
    //     description: 'Create a cube, only one at a time'
    //   }
    // ])
    const plannerAgent = await createModelerPlanner({ llm })

    const superGraph = new StateGraph({ channels: superState })
      // Add steps nodes
      .addNode(Team.SUPERVISOR_NAME, supervisorAgent.withConfig({ runName: Team.SUPERVISOR_NAME }))
      .addNode(Team.TOOLS_NAME, new ToolNode<ModelerState>(tools))
      // .addNode(SUPERVISOR_NAME, RunnableLambda.from(async (state: State) => {
      //   const _state = await supervisorNode.invoke(state)
      //   return {
      //     ..._state,
      //     messages: [
      //       new HumanMessage(`Call ${_state.next} with instructions: ${_state.instructions}`)
      //     ]
      //   }
      // }))
      // .addNode(PLANNER_NAME,
      //   RunnableLambda.from(async (state: State) => {
      //     return plannerAgent.invoke({
      //       input: state.instructions,
      //       role: state.role,
      //       context: state.context,
      //       language: state.language,
      //       messages: []
      //     })
      //   })
      // )
      .addNode(
        DIMENSION_MODELER_NAME,
        RunnableLambda.from(async (state: ModelerState) => {
          const { messages } = await dimensionAgent.invoke({
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
        CUBE_MODELER_NAME,
        RunnableLambda.from(async (state: ModelerState) => {
          const { messages } = await cubeAgent.invoke({
            input: state.instructions,
            role: state.role,
            context: state.context,
            language: state.language,
            messages: []
          })
          return Team.responseToolMessage(state.tool_call_id, messages)
        })
      )
      .addEdge(Team.TOOLS_NAME, Team.SUPERVISOR_NAME)
      .addEdge(DIMENSION_MODELER_NAME, Team.SUPERVISOR_NAME)
      .addEdge(CUBE_MODELER_NAME, Team.SUPERVISOR_NAME)
      .addConditionalEdges(Team.SUPERVISOR_NAME, Team.supervisorRouter)
      .addEdge(START, Team.SUPERVISOR_NAME)

    return superGraph
  }
}
