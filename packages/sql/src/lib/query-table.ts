import { EntityType, QueryOptions } from '@metad/ocap-core'
import { queryCube } from './query'

export function queryTable(options: QueryOptions, entityType: EntityType, dialect: string, catalog?: string) {
  return queryCube(entityType.cube, options, entityType, dialect, catalog)
}
