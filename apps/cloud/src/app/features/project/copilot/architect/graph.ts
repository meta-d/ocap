import { Signal } from '@angular/core'
import { HumanMessage } from '@langchain/core/messages'
import { FewShotPromptTemplate } from '@langchain/core/prompts'
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { Indicator } from '@metad/cloud/state'
import { CreateGraphOptions } from '@metad/copilot'
import { Plan, Route } from '../../../../@core/copilot/'
import { createPlannerAgent } from './agent-planner'
import { createReplannerAgent } from './agent-replanner'
import { INDICATOR_AGENT_NAME, IndicatorArchitectState, PLANNER_NAME, REPLANNER_NAME } from './types'

const superState: StateGraphArgs<IndicatorArchitectState>['channels'] = Plan.createState()

export async function createIndicatorArchitectGraph({
  llm,
  checkpointer,
  createIndicatorGraph,
  fewShotTemplate,
  indicators
}: CreateGraphOptions & {
  createIndicatorGraph: (options: CreateGraphOptions) => Promise<StateGraph<Route.State, Partial<Route.State>, any>>
  fewShotTemplate: FewShotPromptTemplate
  indicators: Signal<Indicator[]>
}) {
  // const supervisorNode = await Team.createSupervisor(
  //   llm,
  //   [PLANNER_NAME, INDICATOR_AGENT_NAME],
  //   Team.SupervisorSystemPrompt +
  //     `Create a plan for the request indicator system if plan is empty, then assign the task to the indicator worker one by one.` +
  //     `\nThe plan is {plan}.`
  // )
  const indicatorWorker = (
    await createIndicatorGraph({
      llm,
      checkpointer
    })
  ).compile({})

  const planner = await createPlannerAgent({ llm, fewShotTemplate, indicators })
  const replanner = await createReplannerAgent({ llm })

  async function executeStep(state: IndicatorArchitectState): Promise<any> {
    const task = state.plan[0]

    const { messages } = await indicatorWorker.invoke({
      messages: [new HumanMessage(task)],
      role: state.role,
      context: state.context,
      input: state.input
    })

    return {
      pastSteps: [[task, messages[messages.length - 1].content.toString()]],
      plan: state.plan.slice(1),
      messages: [
        messages[messages.length - 1]
      ]
    }
  }

  function shouldEnd(state: IndicatorArchitectState) {
    return state.response ? 'true' : 'false'
  }

  const superGraph = new StateGraph({ channels: superState })
    // Add steps nodes
    // .addNode(SUPERVISOR_NAME, supervisorNode)
    .addNode(PLANNER_NAME, planner)
    .addNode(INDICATOR_AGENT_NAME, executeStep)
    .addNode(REPLANNER_NAME, replanner)
    .addEdge(START, PLANNER_NAME)
    .addEdge(PLANNER_NAME, INDICATOR_AGENT_NAME)
    .addEdge(INDICATOR_AGENT_NAME, REPLANNER_NAME)
    .addConditionalEdges(REPLANNER_NAME, shouldEnd, {
      true: END,
      false: INDICATOR_AGENT_NAME
    })

  // .addNode(INDICATOR_AGENT_NAME, Team.getInstructions.pipe(indicatorWorker).pipe(Team.joinGraph))
  // superGraph.addEdge(INDICATOR_AGENT_NAME, SUPERVISOR_NAME)
  // superGraph.addEdge(PLANNER_NAME, SUPERVISOR_NAME)
  // superGraph.addConditionalEdges(SUPERVISOR_NAME, (x) => x.next, {
  //   [INDICATOR_AGENT_NAME]: INDICATOR_AGENT_NAME,
  //   [PLANNER_NAME]: PLANNER_NAME,
  //   FINISH: END
  // })
  // superGraph.addEdge(START, SUPERVISOR_NAME)

  return superGraph
}
