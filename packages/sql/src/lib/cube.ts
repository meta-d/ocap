import {
  AggregationRole,
  Cube,
  EntityType,
  getEntityProperty,
  isMeasure,
  PropertyDimension,
  QueryOptions,
  Schema
} from '@metad/ocap-core'
import { buildDimensionContext, compileDimensionSchema, DimensionContext } from './dimension'

export function compileCubeSchema(entity: string, cube: Cube, dimensions?: PropertyDimension[]): EntityType {
  const properties = {}

  cube.dimensionUsages?.forEach((usage) => {
    const dimension = dimensions?.find((item) => item.name === usage.source)
    if (dimension) {
      const property = compileDimensionSchema(entity, {
        ...dimension,
        name: usage.name,
        foreignKey: usage.foreignKey || dimension.foreignKey
      })
      properties[property.name] = property
    } else {
      throw new Error(`Can't found dimension for source '${usage.source}'`)
    }
  })

  cube.dimensions?.forEach((dimension) => {
    const property = compileDimensionSchema(entity, dimension)
    properties[property.name] = property
  })

  cube.measures?.forEach((measure) => {
    properties[measure.name] = {
      ...measure,
      role: AggregationRole.measure
    }
  })

  return {
    name: entity,
    properties
  }
}

export interface CubeContext {
  schema: Cube
  entityType: EntityType
  dimensions: DimensionContext[]
  measures: any[]
}

export function buildCubeContext(schema: Schema, options: QueryOptions, entityType: EntityType, dialect: string): CubeContext {
  const context = { entityType, dimensions: [], measures: [] } as CubeContext

  ;[...(options.rows ?? []), ...(options.columns ?? [])].forEach((row) => {
    if (isMeasure(row)) {
      const measure = getEntityProperty(entityType, row)
      context.measures.push({
        ...measure,
        alias: measure.name
      })
    } else {
      let dimension = context.dimensions.find((item) => item.dimension.dimension === row.dimension)
      if (!dimension) {
        dimension = { selectFields: [] } as DimensionContext
        context.dimensions.push(dimension)
      }
      buildDimensionContext(dimension, entityType, row)
    }
  })

  return context
}
