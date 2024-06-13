import { Signal, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { CopilotAgentType } from '@metad/copilot'
import { makeTablePrompt } from '@metad/core'
import { NgmCopilotService, createAgentPromptTemplate, injectCopilotCommand } from '@metad/copilot-angular'
import { EntityType, PropertyHierarchy } from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { firstValueFrom } from 'rxjs'
import { ModelDimensionService } from '../../dimension/dimension.service'
import { SemanticModelService } from '../../model.service'
import { markdownTableData } from '../../utils'
import { HierarchySchema } from '../schema'
import { timeLevelFormatter } from './types'

export function injectHierarchyCommand(dimensionService: ModelDimensionService, tableTypes: Signal<EntityType[]>) {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const copilotService = inject(NgmCopilotService)
  const modelService = inject(SemanticModelService)

  const dimension = toSignal(dimensionService.dimension$)

  const createHierarchyTool = new DynamicStructuredTool({
    name: 'createHierarchy',
    description: 'Create or edit hierarchy in dimension.',
    schema: HierarchySchema,
    func: async (h) => {
      logger.debug(`Execute copilot action 'createHierarchy':`, h)
      dimensionService.newHierarchy(h as Partial<PropertyHierarchy>)
      return translate.instant('PAC.MODEL.Copilot.CreatedHierarchy', { Default: 'Created hierarchy!' })
    }
  })

  const commandName = 'hierarchy'
  return injectCopilotCommand(commandName, {
    alias: 'h',
    description: translate.instant('PAC.MODEL.Copilot.CreateHierarchy', { Default: 'Create a new hierarchy' }),
    agent: {
      type: CopilotAgentType.Default
    },
    tools: [createHierarchyTool],
    prompt:
      createAgentPromptTemplate(`You are a cube modeling expert. Let's create a hierarchy in the dimension for cube!
Name should not duplicate name of existing hierarchies, and it should be as short as possible.
Select appropriate table fields to create levels of the hierarchy.
The order of levels in the hierarchy is generally arranged from top to bottom (or from coarse to fine granularity) based on the real-world meaning of the fields used, such as: Year, Quarter, Month, Date.

${timeLevelFormatter()}

{context}
    
{system_prompt}`),
    systemPrompt: async () => {
      const tablesData = await Promise.all(
        tableTypes().map((tableType) => firstValueFrom(modelService.selectTableSamples(tableType.name, 10)))
      )

      return `${copilotService.rolePrompt()}
Current dimension is:
\`\`\`
${JSON.stringify(dimension())}
\`\`\`

The tables used in the current dimension are:
\`\`\`
${tableTypes()
  .map(
    (tableType, index) =>
      makeTablePrompt(tableType) +
      `\nThe top 10 rows of table "${tableType.name}" as follows:\n` +
      markdownTableData(tablesData[index])
  )
  .join('\n')}
\`\`\`
`
    }
  })
}
