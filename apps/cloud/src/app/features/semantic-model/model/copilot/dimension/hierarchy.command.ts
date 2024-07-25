import { Signal, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { Router } from '@angular/router'
import { CopilotAgentType } from '@metad/copilot'
import { createAgentPromptTemplate, injectCopilotCommand } from '@metad/copilot-angular'
import { makeTablePrompt } from '@metad/core'
import { EntityType } from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { firstValueFrom } from 'rxjs'
import { ModelDimensionService } from '../../dimension/dimension.service'
import { SemanticModelService } from '../../model.service'
import { markdownTableData } from '../../utils'
import { injectCreateHierarchyTool } from './tools'
import { timeLevelFormatter } from './types'

export function injectHierarchyCommand(dimensionService: ModelDimensionService, tableTypes: Signal<EntityType[]>) {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const modelService = inject(SemanticModelService)
  const router = inject(Router)

  const createHierarchyTool = injectCreateHierarchyTool()

  const dimension = toSignal(dimensionService.dimension$)

  let urlSnapshot = router.url

  const commandName = 'hierarchy'
  return injectCopilotCommand(
    commandName,
    (async () => {
      const systemContext = async () => {
        const tablesData = await Promise.all(
          tableTypes().map((tableType) => firstValueFrom(modelService.selectTableSamples(tableType.name, 10)))
        )

        return `Current dimension is:
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

      const prompt = await createAgentPromptTemplate(
        `You are a cube modeling expert. Let's create a hierarchy in the dimension for cube!` +
          `\n{role}\n` +
          `Name should not duplicate name of existing hierarchies, and it should be as short as possible.` +
          ` Select appropriate table fields to create levels of the hierarchy.` +
          ` The order of levels in the hierarchy is generally arranged from top to bottom (or from coarse to fine granularity) based on the real-world meaning of the fields used, such as: Year, Quarter, Month, Date.` +
          `\n\n${timeLevelFormatter()}` +
          '\n{context}' +
          `\n{system}`
      ).partial({
        system: systemContext
      })

      return {
        alias: 'h',
        description: translate.instant('PAC.MODEL.Copilot.CreateHierarchy', { Default: 'Create a new hierarchy' }),
        historyCursor: () => {
          urlSnapshot = router.url
          return modelService.getHistoryCursor()
        },
        revert: async (index: number) => {
          modelService.gotoHistoryCursor(index)
          router.navigate([urlSnapshot])
        },
        agent: {
          type: CopilotAgentType.Default
        },
        tools: [createHierarchyTool],
        prompt
      }
    })()
  )
}
