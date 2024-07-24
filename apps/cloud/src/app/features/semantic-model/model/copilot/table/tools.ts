import { inject } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { NGXLogger } from 'ngx-logger'
import { firstValueFrom } from 'rxjs'
import { z } from 'zod'
import { SemanticModelService } from '../../model.service'

export function injectCreateTableTool() {
  const logger = inject(NGXLogger)
  const modelService = inject(SemanticModelService)

  const createTableTool = new DynamicStructuredTool({
    name: 'createTable',
    description: 'Create or edit a table, one table at a time',
    schema: z.object({
      statement: z.string().describe('The statement of creating or modifing a table')
    }),
    func: async ({ statement }) => {
      logger.debug(`Execute copilot action 'createTable': ${statement}`)

      try {
        await firstValueFrom(modelService.originalDataSource.query({ statement, forceRefresh: true }))
        modelService.refreshTableSchema()
      } catch (error: any) {
        return `Failed to create the table: ${error.message}`
      }

      return `The table is created: ${statement}`
    }
  })

  return createTableTool
}
