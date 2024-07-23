import { Signal } from '@angular/core'
import { RunnableLambda } from '@langchain/core/runnables'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { ChatOpenAI } from '@langchain/openai'
import { Team } from '@metad/copilot'
import { PropertyDimension } from '@metad/ocap-core'
import { CUBE_MODELER_NAME } from '../cube'
import { DIMENSION_MODELER_NAME } from '../dimension'
import { getTablesFromDimension } from '../types'
import { ModelerState } from './types'

export async function createSupervisorAgent({
  llm,
  dimensions,
  tools
}: {
  llm: ChatOpenAI
  dimensions: Signal<PropertyDimension[]>
  tools: DynamicStructuredTool[]
}) {
  const getDimensions = async () => {
    return dimensions().length
      ? `Existing shared dimensions:\n` +
          dimensions()
            .map(
              (d) =>
                `- name: ${d.name}
  caption: ${d.caption || ''}
  tables: ${getTablesFromDimension(d).join(', ')}`
            )
            .join('\n')
      : `There are no existing shared dimensions.`
  }

  const agent = await Team.createSupervisorAgent(
    llm,
    [
      {
        name: DIMENSION_MODELER_NAME,
        description: 'Create a dimension, only one at a time'
      },
      {
        name: CUBE_MODELER_NAME,
        description: 'Create a cube, only one at a time'
      }
    ],
    tools,
    `You are a cube modeler for data analysis, now you need create a plan for the final goal.
{role}
{language}
{context}

1. If user-provided tables, consider which of them are used to create shared dimensions and which are used to create cubes.
  Or use the 'selectTables' tool to get all tables then select the required physical tables from them. And use 'queryTables' tool get columns metadata for the required tables.
2. The dimensions of a model are divided into two types: shared dimensions and inline dimensions. 
  If a dimension has an independent dimension table, it can be created as a shared dimension. Otherwise, the dimension field in the fact table is created as an inline dimension. Shared dimensions are created from independent dimension physical tables. 
  If the dimension fields of the model to be created are in the fact table, there is no need to create shared dimensions. 
  If the dimension fields of the fact table need to be associated with independent dimension physical tables, you need to create shared dimensions for this dimension physical table or use existing shared dimensions.
  Create a dimension for fields that clearly belong to different levels of the same dimension, and add the fields from coarse to fine granularity as the levels of the dimension.
  For example, create a dimension called Department with the fields: First-level Department, Second-level Department, Third-level Department, and add First-level Department, Second-level Department, and Third-level Department as the levels of the dimension in order.
  If you are creating a shared dimension, please provide your reason.

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

Avoid creating already existing shared dimensions:
{dimensions}
just use them directly in the cube creation task.
Please plan the cube model first, and then decide to call route to create it step by step.
`,
    `Use only one tool at a time`
  )

  return RunnableLambda.from(async (state: ModelerState) => {
    const dimensions = await getDimensions()
    return {
      ...state,
      dimensions
    }
  }).pipe(agent)
}
