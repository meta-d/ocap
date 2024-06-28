import { inject } from '@angular/core'
import { SystemMessage } from '@langchain/core/messages'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { CreateGraphOptions } from '@metad/copilot'
import { SemanticModelService } from '../../model.service'
import { injectQueryTablesTool, injectSelectTablesTool } from '../tools'
import { injectCreateDimensionTool, injectCreateHierarchyTool } from './tools'
import { timeLevelFormatter } from './types'

export const DIMENSION_MODELER_NAME = 'DimensionModeler'

export const CreateDimensionSystemPrompt =
  `You are a cube modeling expert. Let's create a shared dimension for cube!` +
  ` If the user does not provide a dimension table, use 'selectTables' tool to get the table, and then select a table related to the requirement to create a dimension.` +
  ` If the user does not provide the table field information, use the 'queryTables' tool to obtain the table field structure.` +
  ` If the user wants to add an analysis scenario for the current dimension, please call 'createHierarchy' to add the corresponding hierarchy of the dimension.` +
  '\n' +
  timeLevelFormatter()

export function injectDimensionModeler() {
  const modelService = inject(SemanticModelService)
  const createDimensionTool = injectCreateDimensionTool()
  const createHierarchyTool = injectCreateHierarchyTool()
  const selectTablesTool = injectSelectTablesTool()
  const queryTablesTool = injectQueryTablesTool()

  const dimensions = modelService.dimensions

  const systemContext = async () => {
    return (
      `The dimension name cannot be any of the share dimension names in the list: [${dimensions()
        .map((d) => d.name)
        .join(', ')}].` +
      `The dimension name don't be the same as the table name, It is not necessary to convert all table fields into levels. The levels are arranged in order of granularity from coarse to fine, based on the business data represented by the table fields, for example table: product (id, name, product_category, product_family) to levels: [product_family, product_category, name].` +
      ` Return the 'name' and 'caption' fields of the dimension.`
    )
  }

  return async ({ llm, checkpointer }: CreateGraphOptions) => {
    return createReactAgent({
      llm,
      checkpointSaver: checkpointer,
      tools: [selectTablesTool, queryTablesTool, createDimensionTool, createHierarchyTool],
      messageModifier: async (messages) => {
        return [
          new SystemMessage(CreateDimensionSystemPrompt + `\n\n${await systemContext()}\n\n` + `{context}`),
          ...messages
        ]
      }
    })
  }
}
