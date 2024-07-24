import { RunnableLambda } from '@langchain/core/runnables'
import { START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { CreateGraphOptions, Team } from '@metad/copilot'
import { injectRunTableCreator } from '../table'
import { TABLE_CREATOR_NAME } from '../table/types'
import { createSupervisorAgent } from './supervisor'
import { DBAState } from './types'

const superState: StateGraphArgs<DBAState>['channels'] = {
  ...Team.createState()
}

export function injectDBACreator() {
  const createTableAgent = injectRunTableCreator()

  return async ({ llm }: CreateGraphOptions) => {
    const tools = []
    const supervisorAgent = await createSupervisorAgent({ llm, tools })
    const tableAgent = await createTableAgent({ llm })

    const superGraph = new StateGraph({ channels: superState })
      .addNode(Team.SUPERVISOR_NAME, supervisorAgent)
      .addNode(
        TABLE_CREATOR_NAME,
        RunnableLambda.from(async (state: DBAState) => {
          const { messages } = await tableAgent.invoke({
            input: state.instructions,
            role: state.role,
            context: state.context,
            language: state.language,
            messages: []
          })
          return Team.responseToolMessage(state.tool_call_id, messages)
        })
      )
      .addEdge(TABLE_CREATOR_NAME, Team.SUPERVISOR_NAME)
      .addConditionalEdges(Team.SUPERVISOR_NAME, Team.supervisorRouter)
      .addEdge(START, Team.SUPERVISOR_NAME)

    return superGraph
  }
}
