import { inject } from '@angular/core'
import { RunnableLambda } from '@langchain/core/runnables'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import { START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { CreateGraphOptions, Team } from '@metad/copilot'
import { injectExampleRetriever } from 'apps/cloud/src/app/@core/copilot'
import { SemanticModelService } from '../../model.service'
import { CUBE_MODELER_NAME, injectRunCubeModeler } from '../cube'
import { DIMENSION_MODELER_NAME, injectRunDimensionModeler } from '../dimension/'
import { injectQueryTablesTool, injectSelectTablesTool } from '../tools'
import { createSupervisorAgent } from './supervisor'
import { ModelerState } from './types'

const superState: StateGraphArgs<ModelerState>['channels'] = {
  ...Team.createState()
}

export function injectCreateModelerGraph() {
  const modelService = inject(SemanticModelService)
  const createDimensionModeler = injectRunDimensionModeler()
  const createCubeModeler = injectRunCubeModeler()
  const selectTablesTool = injectSelectTablesTool()
  const queryTablesTool = injectQueryTablesTool()

  const referencesRetriever = injectExampleRetriever('modeler/references', { k: 3, vectorStore: null })

  const dimensions = modelService.dimensions

  return async ({ llm }: CreateGraphOptions) => {
    const tools = [selectTablesTool, queryTablesTool]
    const supervisorAgent = await createSupervisorAgent({ llm, dimensions, tools, referencesRetriever })
    const dimensionAgent = await createDimensionModeler({ llm })
    const cubeAgent = await createCubeModeler({ llm })

    const superGraph = new StateGraph({ channels: superState })
      // Add steps nodes
      .addNode(Team.SUPERVISOR_NAME, supervisorAgent.withConfig({ runName: Team.SUPERVISOR_NAME }))
      .addNode(Team.TOOLS_NAME, new ToolNode<ModelerState>(tools))
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
