import { EntityType } from '@metad/ocap-core'
import { isArray } from 'lodash'
import { serializeName } from './types'

export function getFirstElement<T>(objOrArray: T | T[]): T {
  return isArray(objOrArray) ? objOrArray[0] : objOrArray
}

export function serializeFrom(entityType: EntityType, dialect: string) {
  const table = entityType.table // || getFirstElement<MDX.Table>(entityType.cube?.Table)?.name
  return entityType.expression
    ? `(${entityType.expression}) AS ${serializeName(entityType.name, dialect)}`
    : table
    ? `${serializeName(table, dialect)} AS ${serializeName(entityType.name, dialect)}`
    : serializeName(entityType.name, dialect)
}