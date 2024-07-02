import { Signal } from '@angular/core'
import { AIMessage, BaseMessage, isAIMessage } from '@langchain/core/messages'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableLambda } from '@langchain/core/runnables'
import { DynamicStructuredTool, StructuredTool } from '@langchain/core/tools'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { ChatOpenAI } from '@langchain/openai'
import { PropertyDimension } from '@metad/ocap-core'
import { IPlanState } from './types'
import { createCopilotAgentState } from 'apps/cloud/src/app/@core/copilot'

export async function createModelerPlanner({
  llm,
  selectTablesTool,
  queryTablesTool,
  dimensions
}: {
  llm: ChatOpenAI
  selectTablesTool: DynamicStructuredTool
  queryTablesTool: DynamicStructuredTool
  dimensions: Signal<PropertyDimension[]>
}) {
  const tools = [selectTablesTool, queryTablesTool]

  const plannerPrompt = await ChatPromptTemplate.fromMessages([
    ['system', `You are a cube modeler for data analysis, now you need create a plan for the final goal.` +
      `\n{role}\n` +
      `\n1. If user-provided tables, consider which of them are used to create shared dimensions and which are used to create cubes.` +
      ` Or use the 'selectTables' tool to get all tables then select the required physical tables from them. And use 'queryTables' tool get columns metadata for the required tables.` +
      `\n2. The dimensions of a model are divided into two types: shared dimensions and inline dimensions. If a dimension has an independent dimension table, it can be created as a shared dimension. Otherwise, the dimension field in the fact table is created as an inline dimension. Shared dimensions are created from independent dimension physical tables. If the dimension fields of the model to be created are in the fact table, there is no need to create shared dimensions. If the dimension fields of the fact table need to be associated with independent dimension physical tables, you need to create shared dimensions for this dimension physical table or use existing shared dimensions.` +
      ` If the dimension required for modeling is in the following existing shared dimensions, please do not put it in the plan, just use it directly in the cube creation task.` +
      ` Create a dimension for fields that clearly belong to different levels of the same dimension, and add the fields from coarse to fine granularity as the levels of the dimension.` +
      ` For example, create a dimension called Department with the fields: First-level Department, Second-level Department, Third-level Department, and add First-level Department, Second-level Department, and Third-level Department as the levels of the dimension in order.` +
      `\nIf you are creating a shared dimension, please provide your reason.` +
      `\n3. Distinguish whether each table is a dimension table or a fact table. If it is a dimension table, you need to create a shared dimension for it. If it is a fact table, create a cube and inline dimension or associate the created shared dimension.` +
      `\n4. Each step of the plan corresponds to one of the tasks 'Create a shared dimension' and 'Create a cube with inline dimensions and share dimensions'. ` +
      `\n\nA plan is an array of independent, ordered steps.` +
      ' This plan should involve individual tasks, that if executed correctly will yield the correct answer. Do not add any superfluous steps.' +
      ' The result of the final step should be the final answer. Make sure that each step has all the information needed - do not skip steps.\n\n' +
      `For example: \n` +
      `Objective is: Create a cube using the table.` +
      `\nTable context:` +
      `Table is:
  - name: sales_data
    caption: 销售数据
    columns:
    - name: company_code
      caption: 公司代码
      type: character varying
    - name: product_code
      caption: 产品代码
      type: character varying
    - name: sales_amount
      caption: 销售金额
      type: numeric

  - name: product_data
    caption: 产品数据
    columns:
    - name: product_code
      caption: 产品代码
      type: character varying
    - name: product_name
      caption: 产品名称
      type: character varying
    - name: product_category
      caption: 产品类别
      type: character varying
Answer is: Think about the shared dimension and inline dimension of the model:
The company_code field in the sales_data fact table, it do not have a dimension table, so it is a inline dimension.
The product_code field has a dimension table 'product_data', so it is a shared dimension.
The plan are as follows:
  1. Create a shared dimension 'Product' for table product_data.
  2. Create a cube with share dimension 'Product' and inline dimensions: 'Company' for table sales_data.
` +
      `Objective is: {objective}` +
    `\nTable context:\n{context}`
    ],
    ['user', `{dimensions}`]
  ]).partial({
    dimensions: () => dimensions().length ? 
      `Existing shared dimensions:\n` + dimensions()
        .map((d) => `- name: ${d.name}\n  caption: ${d.caption || ''}`)
        .join('\n')
        : `There are no existing shared dimensions.`
  })

  return createPlannerReactAgent({ llm, tools, systemMessage: plannerPrompt })
}

export function createPlannerReactAgent(props: {
  llm: ChatOpenAI
  tools: StructuredTool[]
  systemMessage: ChatPromptTemplate
}) {
  const { llm, tools, systemMessage } = props

  const schema: StateGraphArgs<IPlanState>['channels'] = {
    ...createCopilotAgentState(),
    objective: {
      value: (left: string, right: string) => right ?? left ?? '',
      default: () => ''
    }
  }

  const endict = new RunnableLambda({
    func: (state: IPlanState) => (state)
  })

  const prompt = ChatPromptTemplate.fromMessages([systemMessage, ['placeholder', '{messages}']])

  const boundModel = endict.pipe(prompt).pipe(
    llm.bindTools([
      ...tools,
    ])
  )

  const toolNode = new ToolNode<{ messages: BaseMessage[] }>(tools)

  // Define the function that determines whether to continue or not
  const route = (state: IPlanState) => {
    const { messages } = state
    const lastMessage = messages[messages.length - 1];
    if (
      isAIMessage(lastMessage) &&
      (!lastMessage.tool_calls || lastMessage.tool_calls.length === 0)
    ) {
      return END;
    }

    // Otherwise we continue
    return 'tools'
  }

  // Define the function that calls the model
  const callModel = async (state: IPlanState, config?: any) => {
    const response = await boundModel.invoke(state)
    // We return an object, because this will get added to the existing list
    return { messages: [response] }
  }

  // Define a new graph
  const workflow = new StateGraph<IPlanState>({
    channels: schema
  })
    .addNode('agent', callModel)
    .addNode('tools', toolNode)
    .addEdge(START, 'agent')
    .addConditionalEdges(
      // First, we define the start node. We use `agent`.
      // This means these are the edges taken after the `agent` node is called.
      'agent',
      // Next, we pass in the function that will determine which node is called next.
      route
    )
    // We now add a normal edge from `tools` to `agent`.
    // This means that after `tools` is called, `agent` node is called next.
    .addEdge('tools', 'agent')

  // // Finally, we compile it!
  // // This compiles it into a LangChain Runnable,
  // // meaning you can use it as you would any other runnable
  // const app = workflow.compile()

  return workflow
}
