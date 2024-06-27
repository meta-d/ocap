import { Signal, inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { NgmCopilotService, injectCopilotCommand } from '@metad/copilot-angular'
import { createAgentStepsInstructions } from '@metad/core'
import { Property } from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { SemanticModelService } from '../../model.service'
import { timeLevelFormatter } from '../dimension/types'
import { injectQueryTablesTool, injectSelectTablesTool } from '../tools'
import { injectCubeModeler } from './graph'
import { injectCreateCubeTool } from './tools'

export const SYSTEM_PROMPT =
  `You are a cube modeling expert. Let's create a cube! Generate cube metadata for MDX.` +
  ` If the user does not provide a fact table for cube, use 'selectTables' tool to get the table, and then select a table related to the requirement to create a cube.` +
  ` If the user does not provide the table field information, use the 'queryTables' tool to obtain the table field structure.` +
  `
${createAgentStepsInstructions(
  `Think about what dimensions and measures are needed to create the Cube based on user input`,
  `For each dimension, first consider selecting existing dimensions from shared dimensions and adding them to the dimensionUsages attribute, and then consider creating new dimensions to the dimensions attribute.` +
    ` Create a dimension for fields that clearly belong to different levels of the same dimension, and add the fields from coarse to fine granularity as the levels of the dimension.` +
    ` For example, create a dimension called Department with the fields: First-level Department, Second-level Department, Third-level Department, and add First-level Department, Second-level Department, and Third-level Department as the levels of the dimension in order.` +
    ` If the dimension table is the fact table of cube, you do not need to fill in the hierarchy tables.` + 
    ` If the column field type of level is non-char type, you need to set level type to the type corresponding to column.`,
  `For each measure, first consider selecting the appropriate measure field from the table fields and adding it to the measures property, and then consider creating calculated measures in the calculatedMembers property.`,
  `Combine the above results to create a complete cube`
)}

${timeLevelFormatter()}`

export function injectCubeCommand(dimensions: Signal<Property[]>) {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const modelService = inject(SemanticModelService)
  const copilotService = inject(NgmCopilotService)
  const createCube = injectCubeModeler()
  // tools
  const createCubeTool = injectCreateCubeTool()
  const selectTablesTool = injectSelectTablesTool()
  const queryTablesTool = injectQueryTablesTool()

  const commandName = 'cube'
  return injectCopilotCommand(
    commandName,
    {
      alias: 'c',
      description: translate.instant('PAC.MODEL.Copilot.CommandCubeDesc', {
        Default: 'Descripe business logic of the cube'
      }),
      historyCursor: () => {
        return modelService.getHistoryCursor()
      },
      revert: async (index: number) => {
        modelService.gotoHistoryCursor(index)
      },
      agent: {
        type: CopilotAgentType.Graph,
        conversation: true
      },
      createGraph: createCube
      // tools: [
      //   selectTablesTool,
      //   queryTablesTool,
      //   createCubeTool
      // ],
      // prompt: await createAgentPromptTemplate(SYSTEM_PROMPT + `\n{context}`).partial({
      //   system: systemContext
      // }),
    }
  )
}
