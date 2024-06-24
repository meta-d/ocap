import { Signal, inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { NgmCopilotService, createAgentPromptTemplate, injectCopilotCommand } from '@metad/copilot-angular'
import { Property } from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { SemanticModelService } from '../../model.service'
import { injectCreateDimensionTool } from './tools'
import { timeLevelFormatter } from './types'
import { injectSelectTablesTool, injectQueryTablesTool } from '../tools'

export const CreateDimensionSystemPrompt =
  `You are a cube modeling expert. Let's create a shared dimension for cube!` + 
  ` If the user does not provide a dimension table, use 'selectTables' tool to get the table, and then select a table related to the requirement to create a dimension.` + 
  ` If the user does not provide the table field information, use the 'queryTables' tool to obtain the table field structure.` + 
  '\n' + timeLevelFormatter() + 
  `\n{system_prompt}`

export function injectDimensionCommand(dimensions: Signal<Property[]>) {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const modelService = inject(SemanticModelService)
  const copilotService = inject(NgmCopilotService)

  const selectTablesTool = injectSelectTablesTool()
  const queryTablesTool = injectQueryTablesTool()
  const createDimensionTool = injectCreateDimensionTool()

  const systemContext = async () => {
    return (
      copilotService.rolePrompt() +
      `The dimension name cannot be any of the share dimension names in the list: [${dimensions()
        .map((d) => d.name)
        .join(', ')}].` +
      `The dimension name don't be the same as the table name, It is not necessary to convert all table fields into levels. The levels are arranged in order of granularity from coarse to fine, based on the business data represented by the table fields, for example table: product (id, name, product_category, product_family) to levels: [product_family, product_category, name].`
    )
  }

  const commandName = 'dimension'
  return injectCopilotCommand(
    commandName,
    (async () => {
      const prompt = await createAgentPromptTemplate(
        `You are a cube modeling expert. Let's create a shared dimension for cube!\n` +
          timeLevelFormatter() +
          `\n{context}\n` +
          `{system}`
      ).partial({
        system: systemContext
      })

      return {
        alias: 'd',
        description: translate.instant('PAC.MODEL.Copilot.CommandDimensionDesc', {Default: 'Descripe business logic of the dimension'}),
        historyCursor: () => {
          return modelService.getHistoryCursor()
        },
        revert: async (index: number) => {
          modelService.gotoHistoryCursor(index)
        },
        agent: {
          type: CopilotAgentType.Default
        },
        tools: [selectTablesTool, queryTablesTool, createDimensionTool],
        prompt
      }
    })()
  )
}
