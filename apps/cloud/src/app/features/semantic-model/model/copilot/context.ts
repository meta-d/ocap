import { inject } from '@angular/core'
import { NgmCopilotContextToken } from '@metad/copilot-angular'
import { DBTable } from '@metad/ocap-core'
import { map, shareReplay } from 'rxjs'
import { SemanticModelService } from '../model.service'
import { queryTableStructureData } from './tools'

export function provideCopilotTables() {
  const modelService = inject(SemanticModelService)
  const copilotContext = inject(NgmCopilotContextToken)

  const tables$ = modelService.selectDBTables().pipe(
    map((tables: DBTable[]) => {
      return tables.map((table) => ({
        value: {
          serizalize: async () => {
            return await queryTableStructureData(modelService, table)
          }
        },
        key: table.name,
        caption: table.caption
      }))
    }),
    shareReplay(1)
  )

  copilotContext.cubes.update(() => tables$)

  return copilotContext
}
