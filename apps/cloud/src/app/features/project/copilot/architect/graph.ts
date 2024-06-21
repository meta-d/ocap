import { BaseMessage } from '@langchain/core/messages'
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { Route, Team } from '../../../../@core/copilot/'
import { CreateGraphOptions } from '@metad/copilot'
import { INDICATOR_AGENT_NAME, PLANNER_NAME, SUPERVISOR_NAME } from './types'
import { createPlannerAgent } from './planner-agent'

// Define the top-level State interface
interface State extends Team.State {
  plan: string[]
}

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
  team_members: {
    value: (x: string[], y: string[]) => x.concat(y),
    default: () => [],
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
    default: () => [],
  },
}

export async function createIndicatorArchitectGraph({
  llm,
  checkpointer,
  copilotRoleContext,
  createIndicatorGraph
}: CreateGraphOptions & {
  copilotRoleContext: () => string
  createIndicatorGraph: (options: CreateGraphOptions) => Promise<StateGraph<Route.State, Partial<Route.State>, any>>
}) {
  const supervisorNode = await Team.createSupervisor(llm, [PLANNER_NAME, INDICATOR_AGENT_NAME], `Create a plan for the request indicator system if plan is empty, then assign the task to the indicator worker one by one.` +
    `\nThe plan is {plan}.`
  )
  const indicatorWorker = (await createIndicatorGraph({
    llm,
    checkpointer
  })).compile({ checkpointer })

  const planner = createPlannerAgent(llm,)

  async function planStep(state: State): Promise<any> {
    const plan = await planner.invoke(state)
    return { plan: plan.steps }
  }

  const superGraph = new StateGraph({ channels: superState })
    // Add steps nodes
    .addNode(SUPERVISOR_NAME, supervisorNode)
    .addNode(PLANNER_NAME, planStep)
    .addNode(INDICATOR_AGENT_NAME, Team.getMessages.pipe(indicatorWorker).pipe(Team.joinGraph))

  superGraph.addEdge(INDICATOR_AGENT_NAME, SUPERVISOR_NAME)
  superGraph.addEdge(PLANNER_NAME, SUPERVISOR_NAME)
  superGraph.addConditionalEdges(SUPERVISOR_NAME, (x) => x.next, {
    [INDICATOR_AGENT_NAME]: INDICATOR_AGENT_NAME,
    [PLANNER_NAME]: PLANNER_NAME,
    FINISH: END,
  })

  superGraph.addEdge(START, SUPERVISOR_NAME)

  return superGraph
}
