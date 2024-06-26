import { Signal } from '@angular/core'
import { HumanMessage } from '@langchain/core/messages'
import { FewShotPromptTemplate } from '@langchain/core/prompts'
import { Runnable, RunnableLambda } from '@langchain/core/runnables'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { CreateGraphOptions } from '@metad/copilot'
import { markdownModelCube } from '@metad/core'
import { EntityType } from '@metad/ocap-core'
import { Route, Team } from '../../../../@core/copilot/'
import { createConditionalAggregationWorker } from './agent-cond-aggr'
import { createFormulaWorker } from './agent-formula'
import { createRestrictedMeasureWorker } from './agent-restricted'
import { createVarianceMeasureWorker } from './agent-variance'
import {
  CONDITIONAL_AGGREGATION_AGENT_NAME,
  FORMULA_AGENT_NAME,
  MEASURE_CONTROL_AGENT_NAME,
  RESTRICTED_AGENT_NAME,
  SUPERVISOR_NAME,
  State,
  VARIANCE_AGENT_NAME
} from './types'

const superState: StateGraphArgs<State>['channels'] = Team.createState()

export async function createCalculationGraph({
  llm,
  checkpointer,
  formulaFewShotPrompt,
  condAggrFewShotPrompt,
  varianceFewShotPrompt,
  defaultModelCube,
  pickCubeTool,
  memberRetrieverTool,
  createFormulaTool,
  createRestrictedMeasureTool,
  createConditionalAggregationTool,
  createVarianceMeasureTool,
  runMeasureControlWorker
}: CreateGraphOptions & {
  formulaFewShotPrompt: FewShotPromptTemplate
  condAggrFewShotPrompt: FewShotPromptTemplate
  varianceFewShotPrompt: FewShotPromptTemplate
  defaultModelCube: Signal<{ dataSource: string; cube: EntityType }>
  pickCubeTool?: DynamicStructuredTool
  memberRetrieverTool?: DynamicStructuredTool
  createFormulaTool?: DynamicStructuredTool
  createRestrictedMeasureTool?: DynamicStructuredTool
  createConditionalAggregationTool?: DynamicStructuredTool
  createVarianceMeasureTool?: DynamicStructuredTool
  runMeasureControlWorker: (options: CreateGraphOptions) => Promise<Runnable>
}) {
  const supervisorNode = await Team.createSupervisor(
    llm,
    [
      RESTRICTED_AGENT_NAME,
      CONDITIONAL_AGGREGATION_AGENT_NAME,
      VARIANCE_AGENT_NAME,
      FORMULA_AGENT_NAME,
      MEASURE_CONTROL_AGENT_NAME
    ],
    `You are a supervisor responsible for selecting one of the following workers: {team_members} .` +
      ` Here are the explanations of these workers to help the agent select the appropriate tools for creating a calculation measure in Cube:` +
      `\n1. **RestrictedMeasureAgent**: This agent allows the creation of measures that aggregate values based on restrictions imposed by dimension members. It is useful when you need to filter or limit the data aggregation to specific members of a dimension.` +
      `\n2. **ConditionalAggregationAgent**: This agent provides the ability to create aggregated measures based on various operations and dimensions. It supports operations such as Count, Sum, TopCount, TopSum, Min, Max, and Avg. This function is suitable when you need to perform different types of aggregations based on certain conditions.` +
      `\n3. **VarianceMeasureAgent**: This agent is designed to create measures that calculate the variance or ratio between different members within a dimension. It is useful for comparing data, such as year-over-year changes, month-over-month changes, differences between versions, or differences between accounts.` +
      `\n4. **FormulaMeasureAgent**: When none of the above agents can meet the requirements, this agent allows the creation of calculated measures using MDX (Multidimensional Expressions) formulas. It provides the flexibility to define complex calculations and custom aggregations.` +
      `\n5. **MeasureControlAgent**: This agent create a calculation measure that allows the selection among multiple measures. It is useful when you need to provide users with the ability to choose from different measures dynamically.` +
      ` Based on the following user request, select an appropriate worker to create a calculation measure.` +
      ` When finished, respond FINISH. Choose strategically to minimize the number of steps taken.` +
      `\n\n{role}` +
      `\n\n{context}`
  )

  const createFormulaAgent = await createFormulaWorker({
    llm,
    tools: [pickCubeTool, memberRetrieverTool, createFormulaTool]
  })
  const createRestrictedMeasureAgent = await createRestrictedMeasureWorker({
    llm,
    tools: [pickCubeTool, memberRetrieverTool, createRestrictedMeasureTool]
  })
  const createConditionalAggregationAgent = await createConditionalAggregationWorker({
    llm,
    tools: [memberRetrieverTool, createConditionalAggregationTool]
  })
  const createVarianceMeasureAgent = await createVarianceMeasureWorker({
    llm,
    tools: [memberRetrieverTool, createVarianceMeasureTool]
  })

  const runCreateFormulaAgent = RunnableLambda.from(async (state: State) => {
    const context = state.context || markdownModelCube(defaultModelCube())
    const input = await formulaFewShotPrompt.format({
      input: state.instructions,
      context
    })
    return {
      messages: [new HumanMessage(input)],
      role: state.role,
      context
    }
  })

  const runCreateConditionalAggregationAgent = RunnableLambda.from(async (state: State) => {
    const context = state.context || markdownModelCube(defaultModelCube())
    const input = await condAggrFewShotPrompt.format({
      input: state.instructions,
      context
    })
    return {
      messages: [new HumanMessage(input)],
      role: state.role,
      context
    }
  })

  const runCreateVarianceMeasureAgent = RunnableLambda.from(async (state: State) => {
    const context = state.context || markdownModelCube(defaultModelCube())
    const input = await varianceFewShotPrompt.format({
      input: state.instructions,
      context
    })
    return {
      messages: [new HumanMessage(input)],
      role: state.role,
      context
    }
  })

  const runCalculationAgent = RunnableLambda.from(async (state: State) => {
    const context = state.context || markdownModelCube(defaultModelCube())
    return {
      messages: [new HumanMessage(state.instructions)],
      role: state.role,
      context
    }
  })

  const superGraph = new StateGraph({ channels: superState })
    // Add steps nodes
    .addNode(SUPERVISOR_NAME, supervisorNode)
    .addNode(
      FORMULA_AGENT_NAME,
      runCreateFormulaAgent.pipe(Route.createRunWorkerAgent(createFormulaAgent, FORMULA_AGENT_NAME))
    )
    .addNode(
      RESTRICTED_AGENT_NAME,
      runCalculationAgent.pipe(Route.createRunWorkerAgent(createRestrictedMeasureAgent, RESTRICTED_AGENT_NAME))
    )
    .addNode(
      CONDITIONAL_AGGREGATION_AGENT_NAME,
      runCreateConditionalAggregationAgent.pipe(
        Route.createRunWorkerAgent(createConditionalAggregationAgent, CONDITIONAL_AGGREGATION_AGENT_NAME)
      )
    )
    .addNode(
      VARIANCE_AGENT_NAME,
      runCreateVarianceMeasureAgent.pipe(Route.createRunWorkerAgent(createVarianceMeasureAgent, VARIANCE_AGENT_NAME))
    )
    .addNode(MEASURE_CONTROL_AGENT_NAME, await runMeasureControlWorker({ llm }))

  superGraph.addEdge(FORMULA_AGENT_NAME, SUPERVISOR_NAME)
  superGraph.addEdge(RESTRICTED_AGENT_NAME, SUPERVISOR_NAME)
  superGraph.addEdge(CONDITIONAL_AGGREGATION_AGENT_NAME, SUPERVISOR_NAME)
  superGraph.addEdge(VARIANCE_AGENT_NAME, SUPERVISOR_NAME)
  superGraph.addEdge(MEASURE_CONTROL_AGENT_NAME, SUPERVISOR_NAME)
  superGraph.addConditionalEdges(SUPERVISOR_NAME, (x) => x.next, {
    [FORMULA_AGENT_NAME]: FORMULA_AGENT_NAME,
    [RESTRICTED_AGENT_NAME]: RESTRICTED_AGENT_NAME,
    [CONDITIONAL_AGGREGATION_AGENT_NAME]: CONDITIONAL_AGGREGATION_AGENT_NAME,
    [VARIANCE_AGENT_NAME]: VARIANCE_AGENT_NAME,
    [MEASURE_CONTROL_AGENT_NAME]: MEASURE_CONTROL_AGENT_NAME,
    FINISH: END
  })

  superGraph.addEdge(START, SUPERVISOR_NAME)

  return superGraph
}
