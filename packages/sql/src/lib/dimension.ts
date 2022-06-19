import { Dimension, EntityType, Schema } from '@metad/ocap-core'
import { From } from './query'
import { serializeName } from './types'

export function DimensionMembers(dimension: Dimension, entityType: EntityType, schema: Schema, dialect?: string) {
  return `SELECT DISTINCT ${serializeName(dimension.dimension, dialect)} FROM ${From(entityType, schema, dialect)}`
}
