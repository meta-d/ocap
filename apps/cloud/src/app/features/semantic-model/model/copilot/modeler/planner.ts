import { inject } from '@angular/core'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { RunnableLambda } from '@langchain/core/runnables'
import { StateGraphArgs } from '@langchain/langgraph/web'
import { ChatOpenAI } from '@langchain/openai'
import { AgentState } from '@metad/copilot-angular'
import {
  injectAgentFewShotTemplate
} from 'apps/cloud/src/app/@core/copilot'
import { SemanticModelService } from '../../model.service'
import { injectQueryTablesTool, injectSelectTablesTool } from '../tools'
import { createCopilotAgentState, createReactAgent, Team } from '@metad/copilot'

const SYSTEM_PROMPT =
  `You are a cube modeler for data analysis, now you need create a plan for the final goal.
{role}
{language}
1. If user-provided tables, consider which of them are used to create shared dimensions and which are used to create cubes.
  Or use the 'selectTables' tool to get all tables then select the required physical tables from them.
2. The dimensions of a model are divided into two types: shared dimensions and inline dimensions. If a dimension has an independent dimension table, it can be created as a shared dimension. Otherwise, the dimension field in the fact table is created as an inline dimension. Shared dimensions are created from independent dimension physical tables. 
  If the dimension fields of the model to be created are in the fact table, there is no need to create shared dimensions. 
  If the dimension fields of the fact table need to be associated with independent dimension physical tables, you need to create shared dimensions for this dimension physical table or use existing shared dimensions.
  Create a dimension for fields that clearly belong to different levels of the same dimension, and add the fields from coarse to fine granularity as the levels of the dimension.
  For example, create a dimension called Department with the fields: First-level Department, Second-level Department, Third-level Department, and add First-level Department, Second-level Department, and Third-level Department as the levels of the dimension in order.
  If you are creating a shared dimension, please provide your reason.
3. Distinguish whether each table is a dimension table or a fact table. If it is a dimension table, you need to create a shared dimension for it. If it is a fact table, create a cube and inline dimension or associate the created shared dimension.
4. Each step of the plan corresponds to one of the tasks 'Create a shared dimension' and 'Create a cube with inline dimensions and share dimensions'.

A plan is an array of independent, ordered steps.
This plan should involve individual tasks, that if executed correctly will yield the correct answer. Do not add any superfluous steps.
The result of the final step should be the final answer. Make sure that each step has all the information needed - do not skip steps.

For example:
  Objective is: Create a cube using the table.
  Table context:
    Table is:
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

Table context:
{context}

Avoid creating already existing shared dimensions:
{dimensions}
just use them directly in the cube creation task.
`

export function injectCreateModelerPlanner() {
  const modelService = inject(SemanticModelService)
  const selectTablesTool = injectSelectTablesTool()
  const queryTablesTool = injectQueryTablesTool()

  const dimensions = modelService.dimensions

  return async ({ llm }: { llm: ChatOpenAI }) => {
    const tools = [selectTablesTool, queryTablesTool]

    const systemContext = async () => {
      return dimensions().length
        ? `Existing shared dimensions:\n` +
            dimensions()
              .map((d) => `- name: ${d.name}\n  caption: ${d.caption || ''}`)
              .join('\n')
        : `There are no existing shared dimensions.`
    }

    const state: StateGraphArgs<AgentState>['channels'] = createCopilotAgentState()
    return createReactAgent({
      llm,
      state,
      tools,
      messageModifier: async (state) => {
        const system = await SystemMessagePromptTemplate.fromTemplate(SYSTEM_PROMPT).format({
          ...state,
          dimensions: await systemContext()
        })
        return [new SystemMessage(system), ...state.messages]
      }
    })
  }
}

export function injectRunModelerPlanner() {
  const createModelerPlanner = injectCreateModelerPlanner()
  const fewShotPrompt = injectAgentFewShotTemplate('modeler/planner', { k: 1, vectorStore: null })

  return async ({ llm }: { llm: ChatOpenAI }) => {
    const agent = await createModelerPlanner({ llm })

    return RunnableLambda.from(async (state: AgentState) => {
      const content = await fewShotPrompt.format({ input: state.input, context: '' })
      return {
        input: state.input,
        messages: [new HumanMessage(content)],
        role: state.role,
        context: state.context,
        language: state.language,
      }
    })
      .pipe(agent)
      .pipe(Team.joinGraph)
  }
}
