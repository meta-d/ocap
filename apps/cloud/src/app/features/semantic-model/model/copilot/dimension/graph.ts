import { inject } from '@angular/core'
import { ChatOpenAI } from '@langchain/openai'
import { NgmCopilotService } from '@metad/copilot-angular'
import { SemanticModelService } from '../../model.service'
import { createCommandAgent } from '../langgraph-helper-utilities'
import { CreateDimensionSystemPrompt } from './dimension.command'
import { injectCreateDimensionTool } from './tools'
import { injectSelectTablesTool, injectQueryTablesTool } from '../tools'

export const DIMENSION_MODELER_NAME = 'DimensionModeler'

export function injectDimensionModeler() {
  const copilotService = inject(NgmCopilotService)
  const modelService = inject(SemanticModelService)
  const createDimensionTool = injectCreateDimensionTool()
  const selectTablesTool = injectSelectTablesTool()
  const queryTablesTool = injectQueryTablesTool()

  const dimensions = modelService.dimensions

  const systemContext = async () => {
    return (
      copilotService.rolePrompt() +
      `The dimension name cannot be any of the share dimension names in the list: [${dimensions()
        .map((d) => d.name)
        .join(', ')}].` +
      `The dimension name don't be the same as the table name, It is not necessary to convert all table fields into levels. The levels are arranged in order of granularity from coarse to fine, based on the business data represented by the table fields, for example table: product (id, name, product_category, product_family) to levels: [product_family, product_category, name].` +
      ` Return the 'name' and 'caption' fields of the dimension.`
    )
  }

  return async (llm: ChatOpenAI) => {
    const agent = await createCommandAgent(llm, [
      selectTablesTool,
      queryTablesTool,
      createDimensionTool
    ], CreateDimensionSystemPrompt, systemContext)
    return agent
  }
}
