import { inject } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { DBTable } from '@metad/ocap-core'
import { firstValueFrom } from 'rxjs'
import { z } from 'zod'
import { SemanticModelService } from '../model.service'
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
        const tableStr = await queryTableStructureData(modelService, { name: table })
        info += tableStr + '\n\n'
      }

      return info
    }
  })

  return queryTablesTool
}

export async function queryTableStructureData(modelService: SemanticModelService, table: DBTable) {
  const columns = await firstValueFrom(modelService.selectOriginalEntityProperties(table.name))
  const topCount = 10
  const samples = await firstValueFrom(modelService.selectTableSamples(table.name, topCount))
  const dataPrompt =
    `The first ${topCount} rows of the table "${table.name}" are as follows:` + '\n' + markdownTableData(samples)
  return (
    [
      '```',
      `Table is:`,
      `  - name: ${table.name}`,
      `    caption: ${table.caption || ''}`,
      `    columns:`,
      columns
        .map((t) =>
          [
            `    - name: ${t.name}`,
            `      caption: ${t.caption || ''}`,
            `      type: ${t.dataType || ''}`
          ].join('\n')
        )
        .join('\n')
    ].join('\n') +
    '```' +
    '\n\n' +
    dataPrompt
  )
}
