import { computed, inject } from '@angular/core'
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { CreateGraphOptions } from '@metad/copilot'
import { Plan, injectAgentFewShotTemplate } from '../../../../@core/copilot/'
import { ProjectService } from '../../project.service'
import { injectRunIndicatorAgent } from '../indicator/graph'
import { createPlannerAgent } from './agent-planner'
import { createReplannerAgent } from './agent-replanner'
import {
  INDICATOR_AGENT_NAME,
  IndicatorArchitectCommandName,
  IndicatorArchitectState,
  PLANNER_NAME,
  REPLANNER_NAME
} from './types'

const superState: StateGraphArgs<IndicatorArchitectState>['channels'] = Plan.createState()

export function injectCreateIndicatorArchitect() {
  const fewShotTemplate = injectAgentFewShotTemplate(IndicatorArchitectCommandName, { k: 1, vectorStore: null })
  const projectService = inject(ProjectService)
  const createIndicatorGraph = injectRunIndicatorAgent()

  const indicators = computed(() => projectService.indicators() ?? [])

  return async ({ llm, checkpointer, interruptBefore, interruptAfter}: CreateGraphOptions) => {
    const indicatorWorker = await createIndicatorGraph({ llm })

    const planner = await createPlannerAgent({ llm, fewShotTemplate, indicators })
    const replanner = await createReplannerAgent({ llm })

    async function executeStep(state: IndicatorArchitectState): Promise<any> {
      const task = state.plan[0]

      const { messages } = await indicatorWorker.invoke({
        messages: [],
        role: state.role,
        context: state.context,
        input: task
      })

      return {
        pastSteps: [[task, messages[messages.length - 1].content.toString()]],
        plan: state.plan.slice(1),
        messages: [messages[messages.length - 1]]
      }
    }

    function shouldEnd(state: IndicatorArchitectState) {
      return state.response ? 'true' : 'false'
    }

    const superGraph = new StateGraph({ channels: superState })
      // Add steps nodes
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

    return superGraph.compile({ checkpointer, interruptBefore, interruptAfter})
  }
}
