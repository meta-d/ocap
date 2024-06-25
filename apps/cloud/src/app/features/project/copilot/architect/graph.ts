import { BaseMessage, HumanMessage } from '@langchain/core/messages'
import { FewShotPromptTemplate } from '@langchain/core/prompts'
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { CreateGraphOptions } from '@metad/copilot'
import { Route, Team } from '../../../../@core/copilot/'
import { createPlannerAgent } from './planner-agent'
import { INDICATOR_AGENT_NAME, PLANNER_NAME, SUPERVISOR_NAME, markdownIndicators } from './types'
import { Signal } from '@angular/core'
import { Indicator } from '@metad/cloud/state'

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
  copilotRoleContext,
  createIndicatorGraph,
  fewShotTemplate,
  indicators
}: CreateGraphOptions & {
  copilotRoleContext: () => string
  createIndicatorGraph: (options: CreateGraphOptions) => Promise<StateGraph<Route.State, Partial<Route.State>, any>>
  fewShotTemplate: FewShotPromptTemplate
  indicators: Signal<Indicator[]>
}) {
  const supervisorNode = await Team.createSupervisor(
    llm,
    [PLANNER_NAME, INDICATOR_AGENT_NAME],
    Team.SupervisorSystemPrompt + `Create a plan for the request indicator system if plan is empty, then assign the task to the indicator worker one by one.` +
      `\nThe plan is {plan}.`
  )
  const indicatorWorker = (
    await createIndicatorGraph({
      llm,
      checkpointer
    })
  ).compile({ checkpointer })

  const planner = createPlannerAgent(
    llm,
    `As an Indicator System Architect specializing in data analysis, your task is to develop a set of indicators specifically tailored for business data analysis based on model information and user prompt, aligning with your business role.` +
      ` Your goal is to create a detailed plan outlining the necessary steps for the creation of these indicators, with each step corresponding to the development of one indicator and ordered in the sequence required for completion.`
  )

  async function planStep(state: State): Promise<any> {
    // Call fewshot examples prompt
    const userInput = state.messages.map((x) => x.content).join('\n')
    console.log('userInput', userInput, `state:`, state)
    const content = await fewShotTemplate.format({ input: userInput, context: state.context })
    console.log(`FewShotTemplate content:`, content)

    const plan = await planner.invoke({
      ...state,
      messages: [
        new HumanMessage(`Existing indicators do not need to be created again. Exisiting indicators:\n` + markdownIndicators(indicators())),
        new HumanMessage(content)
      ]
    })

    console.log(`The plan steps:`, plan.steps)

    return { plan: plan.steps }
  }

  const superGraph = new StateGraph({ channels: superState })
    // Add steps nodes
    .addNode(SUPERVISOR_NAME, supervisorNode)
    .addNode(PLANNER_NAME, planStep)
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
