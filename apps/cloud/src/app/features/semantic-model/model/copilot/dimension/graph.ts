import { inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ChatOpenAI } from '@langchain/openai'
import { NgmCopilotService } from '@metad/copilot-angular'
import { SemanticModelService } from '../../model.service'
import { createCommandAgent } from '../langgraph-helper-utilities'
import { systemPrompt } from './dimension.command'
import { injectCreateDimensionTool } from './tools'

export const DimensionModelerName = 'DimensionModeler'

export function injectDimensionModeler() {
  const copilotService = inject(NgmCopilotService)
  const modelService = inject(SemanticModelService)
  const createDimensionTool = injectCreateDimensionTool()

  const dimensions = toSignal(modelService.dimensions$)

  const systemContext = async () => {
    console.log(`systemContext for dimension`)
    return (
      copilotService.rolePrompt() +
      `The dimension name cannot be any of the share dimension names in the array.: [${dimensions()
        .map((d) => d.name)
        .join(', ')}].` +
      `The dimension name don't be the same as the table name, It is not necessary to convert all table fields into levels. The levels are arranged in order of granularity from coarse to fine, based on the business data represented by the table fields, for example table: product (id, name, product_category, product_family) to levels: [product_family, product_category, name].`
    )
  }

  return async (llm: ChatOpenAI) => {
    const agent = await createCommandAgent(llm, [createDimensionTool], systemPrompt, systemContext)
    return agent
  }
}
