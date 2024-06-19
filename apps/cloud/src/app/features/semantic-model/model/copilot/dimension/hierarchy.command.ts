import { Signal, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { CopilotAgentType } from '@metad/copilot'
import { createAgentPromptTemplate, injectCopilotCommand } from '@metad/copilot-angular'
import { makeTablePrompt } from '@metad/core'
import { EntityType, PropertyHierarchy } from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { firstValueFrom } from 'rxjs'
import { ModelDimensionService } from '../../dimension/dimension.service'
import { SemanticModelService } from '../../model.service'
import { markdownTableData } from '../../utils'
import { HierarchySchema } from '../schema'
import { injectCopilotRoleContext } from '../types'
import { timeLevelFormatter } from './types'

export function injectHierarchyCommand(dimensionService: ModelDimensionService, tableTypes: Signal<EntityType[]>) {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const modelService = inject(SemanticModelService)
  const copilotRoleContext = injectCopilotRoleContext()
  const route = inject(ActivatedRoute)
  const router = inject(Router)

  const dimension = toSignal(dimensionService.dimension$)

  const createHierarchyTool = new DynamicStructuredTool({
    name: 'createHierarchy',
    description: 'Create or edit hierarchy in dimension.',
    schema: HierarchySchema,
    func: async (h) => {
      logger.debug(`Execute copilot action 'createHierarchy':`, h)
      dimensionService.upsertHierarchy(h as Partial<PropertyHierarchy>)
      return translate.instant('PAC.MODEL.Copilot.CreatedHierarchy', { Default: 'Created hierarchy!' })
    }
  })

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
        system: systemContext,
        role: copilotRoleContext
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

// function navigateToRouteSnapshot(router: Router, snapshot: ActivatedRouteSnapshot) {
//   const url = snapshot.pathFromRoot.map((segment) => segment.url.map((segment) => segment.path).join('/')).join('/')
//   router.navigate([url], { queryParams: snapshot.queryParams })
// }
