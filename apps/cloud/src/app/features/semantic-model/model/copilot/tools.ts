import { inject } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { markdownEntityType, markdownTable } from '@metad/core'
import { DBTable } from '@metad/ocap-core'
import { firstValueFrom } from 'rxjs'
import { z } from 'zod'
import { SemanticModelService } from '../model.service'
import { MODEL_TYPE } from '../types'
import { markdownTableData } from '../utils'

export function injectSelectTablesTool() {
  const modelService = inject(SemanticModelService)

  const selectTablesTool = new DynamicStructuredTool({
    name: 'selectTables',
    description: 'Select tables for shared dimension or cube.',
    schema: z.object({}),
    func: async () => {
      const tables = await firstValueFrom(modelService.selectDBTables())
      return tables.map((t) => `  - name: ${t.name}\n    caption: ${t.caption || ''}`).join('\n')
    }
  })

  return selectTablesTool
}

export function injectQueryTablesTool() {
  const modelService = inject(SemanticModelService)

  const queryTablesTool = new DynamicStructuredTool({
    name: 'queryTables',
    description: 'Query the structure of tables.',
    schema: z.object({
      tables: z.array(z.string())
    }),
    func: async ({ tables }) => {
      let info = ''
      for await (const table of tables) {
        const tableStr = await queryEntityStructureData(modelService, { name: table })
        info += tableStr + '\n\n'
      }

      return info
    }
  })

  return queryTablesTool
}

/**
 * Provide table or cube structure description
 *
 * @param modelService
 * @param table
 * @returns
 */
export async function queryEntityStructureData(modelService: SemanticModelService, table: DBTable) {
  const entityType = await firstValueFrom(modelService.selectOriginalEntityType(table.name))
  let dataPrompt = ''
  if (modelService.modelType() === MODEL_TYPE.OLAP || modelService.modelType() === MODEL_TYPE.SQL) {
    const topCount = 10
    const samples = await firstValueFrom(modelService.selectTableSamples(table.name, topCount))
    dataPrompt =
      `The first ${topCount} rows of the table "${table.name}" are as follows:` + '\n' + markdownTableData(samples)
    return markdownTable(entityType) + `\n\n${dataPrompt}`
  }

  return markdownEntityType(entityType)
}
