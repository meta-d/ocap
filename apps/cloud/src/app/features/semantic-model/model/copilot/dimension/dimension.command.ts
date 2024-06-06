import { Signal, inject } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { CopilotAgentType } from '@metad/copilot'
import { NgmCopilotService, createAgentPromptTemplate, injectCopilotCommand } from '@metad/ocap-angular/copilot'
import { Property } from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { SemanticModelService } from '../../model.service'
import { DimensionSchema } from '../schema'
import { createDimension } from './chat'

export function injectDimensionCommand(dimensions: Signal<Property[]>) {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const modelService = inject(SemanticModelService)
  const copilotService = inject(NgmCopilotService)

  const createDimensionTool = new DynamicStructuredTool({
    name: 'createDimension',
    description: 'Create or edit shared dimension for cube.',
    schema: DimensionSchema,
    func: async (d) => {
      logger.debug(`Execute copilot action 'createDimension':`, d)
      createDimension(modelService, d as any)
      return translate.instant('PAC.MODEL.Copilot.CreatedDimension', { Default: 'Created Dimension!' })
    }
  })

  const commandName = 'dimension'
  return injectCopilotCommand(commandName, {
    alias: 'd',
    description: 'New or edit dimension',
    agent: {
      type: CopilotAgentType.Default
    },
    tools: [createDimensionTool],
    prompt: createAgentPromptTemplate(`You are a cube modeling expert. Let's create a shared dimension for cube!
${timeLevelFormatter()}

{context}
    
{system_prompt}`),
    systemPrompt: async () => {
      return `${copilotService.rolePrompt()}
The dimension name cannot be any of the share dimension names in the array.: [${dimensions()
        .map((d) => d.name)
        .join(', ')}].
The dimension name don't be the same as the table name, It is not necessary to convert all table fields into levels. The levels are arranged in order of granularity from coarse to fine, based on the business data represented by the table fields, for example table: product (id, name, product_category, product_family) to levels: [product_family, product_category, name].`
    }
  })
}

function timeLevelFormatter() {
  return `If you are creating a time dimension, the semantic formatter in time level is date-fns format string to format date to the time dimension member key.
For examples: 
if the time dimension table field value of every levels:
  - year: '2024'
  - quarter: 'Q1'
  - month: '2024-01'
then the dimension member key of month level is [2024].[Q1].[2024-01]
so the formmater of quarter level: "[yyyy].['Q'Q]"
month level is "[yyyy].['Q'Q].[yyyy-MM]".

if the time dimension table field value of every levels:
  - year: '2024'
  - quarter: 'FY2024 Q1'
  - month: '202401'
then the dimension member key of month level is [2024].[FY2024 Q1].[202401]
so the formmater of quarter level: "[yyyy].['FY'yyyy 'Q'Q]"
month level is "[yyyy].['FY'yyyy 'Q'Q].[yyyyMM]".

The value of the specific time level can refer to the level keyColumn field name and the given table records.
`
}