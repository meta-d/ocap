import { inject } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { firstValueFrom } from 'rxjs'
import { z } from 'zod'
import { SemanticModelService } from '../../model.service'

export function injectSelectTablesTool() {
  const modelService = inject(SemanticModelService)

  const selectTablesTool = new DynamicStructuredTool({
    name: 'selectTables',
    description: 'Select tables for shared dimension or cube.',
    schema: z.object({}),
    func: async () => {
      const tables = await firstValueFrom(modelService.selectDBTables())
      return tables.map((t) => `- name: ${t.name}\n  caption: ${t.caption || ''}`).join('\n')
    }
  })

  return selectTablesTool
}
