import { computed, inject, Signal } from '@angular/core'
import { ToolMessage } from '@langchain/core/messages'
import { RunnableLambda } from '@langchain/core/runnables'
import { START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { ChatOpenAI } from '@langchain/openai'
import { Indicator } from '@metad/cloud/state'
import { CreateGraphOptions, Team } from '@metad/copilot'
import { ProjectService } from '../../project.service'
import { injectRunIndicatorAgent } from '../indicator/graph'
import { INDICATOR_AGENT_NAME, IndicatorArchitectState, markdownIndicators } from './types'
import { promptIndicatorCode } from '../prompt'

const superState: StateGraphArgs<IndicatorArchitectState>['channels'] = Team.createState()

export function injectCreateIndicatorArchitect() {
  const projectService = inject(ProjectService)
  const createIndicatorGraph = injectRunIndicatorAgent()

  const indicators = computed(() => projectService.indicators() ?? [])

  return async ({ llm, checkpointer, interruptBefore, interruptAfter }: CreateGraphOptions) => {
    const indicatorWorker = await createIndicatorGraph({ llm })

    // const planner = await createPlannerAgent({ llm, fewShotTemplate, indicators })
    // const replanner = await createReplannerAgent({ llm })

    const supervisorAgent = await createSupervisorAgent({ llm, indicators })

    async function executeStep(state: IndicatorArchitectState): Promise<any> {
      const { messages } = await indicatorWorker.invoke({
        messages: [],
        role: state.role,
        context: state.context,
        input: state.instructions
      })

      return {
        tool_call_id: null,
        messages: [
          new ToolMessage({
            tool_call_id: state.tool_call_id,
            content: messages[messages.length - 1].content
          })
        ]
      }
    }

    // function shouldEnd(state: IndicatorArchitectState) {
    //   return state.response ? 'true' : 'false'
    // }

    const superGraph = new StateGraph({ channels: superState })
      // Add steps nodes
      .addNode(Team.SUPERVISOR_NAME, supervisorAgent.withConfig({ runName: Team.SUPERVISOR_NAME }))
      // .addNode(PLANNER_NAME, planner)
      .addNode(INDICATOR_AGENT_NAME, executeStep)
      // .addNode(REPLANNER_NAME, replanner)
      .addEdge(START, Team.SUPERVISOR_NAME)
      // .addEdge(PLANNER_NAME, INDICATOR_AGENT_NAME)
      .addEdge(INDICATOR_AGENT_NAME, Team.SUPERVISOR_NAME)
      .addConditionalEdges(Team.SUPERVISOR_NAME, Team.supervisorRouter)

    return superGraph.compile({ checkpointer, interruptBefore, interruptAfter })
  }
}

export async function createSupervisorAgent({ llm, indicators }: { llm: ChatOpenAI; indicators: Signal<Indicator[]> }) {
  const agent = await Team.createSupervisorAgent(
    llm,
    [
      {
        name: INDICATOR_AGENT_NAME,
        description: 'Create an indicator, only one at a time'
      }
    ],
    `As a indicator system architect specializing in data analysis, your task is to develop a set of indicators specifically for business data analysis based on multidimensional cube information and user prompts, and align with your business role.
Each indicator gives a concise business requirement and name, and the indicators are sorted in the order of creation dependencies.

{role}

{context}

Methods for indicator design:
- Directly use the basic measures defined in the model, which are measurement data extracted directly from the data source, such as sales amount, inventory quantity, etc.
- Design indicators with calculation formulas, which are indicators calculated based on basic measures, such as year-on-year growth rate, average inventory turnover rate, etc.
- Use Restricted filters to limit measurement data according to specific conditions or dimensions, such as sales in a specific time period, inventory in a certain area, etc.

1. Do not create duplicate indicators that already exist:
{indicators}

2. ${promptIndicatorCode(`{indicators}`)}
`
  )

  return RunnableLambda.from(async (state: IndicatorArchitectState) => {
    return {
      ...state,
      indicators: markdownIndicators(indicators())
    }
  }).pipe(agent)
}
