import { Signal } from '@angular/core'
import { BaseMessage, HumanMessage } from '@langchain/core/messages'
import { FewShotPromptTemplate } from '@langchain/core/prompts'
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { Indicator } from '@metad/cloud/state'
import { CreateGraphOptions } from '@metad/copilot'
import { Route, Team } from '../../../../@core/copilot/'
import { createPlannerAgent } from './agent-planner'
import { INDICATOR_AGENT_NAME, PLANNER_NAME, SUPERVISOR_NAME, State } from './types'


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
  },
  reasoning: {
    value: (x: string, y?: string) => y ?? x,
    default: () => ''
  },
  plan: {
    value: (x?: string[], y?: string[]) => y ?? x ?? [],
    default: () => []
  }
}

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
  const supervisorNode = await Team.createSupervisor(
    llm,
    [PLANNER_NAME, INDICATOR_AGENT_NAME],
    Team.SupervisorSystemPrompt +
      `Create a plan for the request indicator system if plan is empty, then assign the task to the indicator worker one by one.` +
      `\nThe plan is {plan}.`
  )
  const indicatorWorker = (
    await createIndicatorGraph({
      llm,
      checkpointer
    })
  ).compile({ checkpointer })

  const planner = await createPlannerAgent({llm, fewShotTemplate, indicators})

  const superGraph = new StateGraph({ channels: superState })
    // Add steps nodes
    .addNode(SUPERVISOR_NAME, supervisorNode)
    .addNode(PLANNER_NAME, planner)
    .addNode(INDICATOR_AGENT_NAME, Team.getInstructions.pipe(indicatorWorker).pipe(Team.joinGraph))

  superGraph.addEdge(INDICATOR_AGENT_NAME, SUPERVISOR_NAME)
  superGraph.addEdge(PLANNER_NAME, SUPERVISOR_NAME)
  superGraph.addConditionalEdges(SUPERVISOR_NAME, (x) => x.next, {
    [INDICATOR_AGENT_NAME]: INDICATOR_AGENT_NAME,
    [PLANNER_NAME]: PLANNER_NAME,
    FINISH: END
  })

  superGraph.addEdge(START, SUPERVISOR_NAME)

  return superGraph
}
