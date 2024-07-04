import { WritableSignal, inject } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { NGXLogger } from 'ngx-logger'
import { firstValueFrom } from 'rxjs'
import { z } from 'zod'
import { SemanticModelService } from '../../model.service'
import { QueryLabService } from '../../query-lab/query-lab.service'
import { getErrorMessage } from '@metad/ocap-angular/core'

export function injectQueryTablesTool() {
  const modelService = inject(SemanticModelService)
  const queryLabService = inject(QueryLabService, { optional: true })

  const queryTablesTool = new DynamicStructuredTool({
    name: 'queryTables',
    description: 'Query table structure for query.',
    schema: z.object({
      tables: z.array(z.string())
    }),
    func: async ({ tables }) => {
      let info = ''
      for await (const table of tables) {
        queryLabService.addEntity({ entity: table })
        const columns = await firstValueFrom(modelService.selectOriginalEntityProperties(table))
        info +=
          `Columns of table '${table}':\n` +
          columns.map((t) => `- name: ${t.name}\n  caption: ${t.caption || ''}`).join('\n') +
          '\n\n'
      }

      return info
    }
  })

  return queryTablesTool
}

export function injectCreateQueryTool(statement: WritableSignal<string>, callback) {
  const logger = inject(NGXLogger)

  const createQueryTool = new DynamicStructuredTool({
    name: 'createQuery',
    description: `Create or edit query statement. query extracting info to answer the user's question.
statement should be written using this database schema.
The query should be returned in plain text, not in JSON.`,
    schema: z.object({
      query: z.string().min(10)
    }),
    func: async ({ query }) => {
      logger.debug(`Execute copilot action 'createQuery':`, query)
      statement.set(query)
      try {
        const result = await callback(query)
        if (result.error) {
          return `Error: ${result.error}`
        }
        return `Query statement is:
\`\`\`sql
${query}
\`\`\`

And the total number of rows returned is ${result.data.length}.`
      } catch (error) {
        return `Error: ${getErrorMessage(error)}`
      }
    }
  })

  return createQueryTool
}
