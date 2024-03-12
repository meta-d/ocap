import {
  AggregationRole,
  AnalyticsAnnotation,
  Dimension,
  EntityType,
  getEntityProperty2
} from '@metad/ocap-core'

/**
 * Due to the instability of the AI's returned results, it is necessary to attempt to fix dimensions for different situations:
 * The dimensional attributes returned by AI may be level, hierarchy or dimension.
 *
 * @param entityType
 * @param dimension
 * @returns
 */
export function tryFixDimension(entityType: EntityType, dimension: Dimension) {
  let property = null
  if (dimension.level) {
    property = getEntityProperty2(entityType, dimension.level)
  } else if (dimension.hierarchy) {
    property = getEntityProperty2(entityType, dimension.hierarchy)
  } else if (dimension.dimension) {
    property = getEntityProperty2(entityType, dimension.dimension)
  }

  switch (property?.role) {
    case AggregationRole.dimension:
      return {
        dimension: property.name
      }
    case AggregationRole.hierarchy:
      return {
        dimension: property.dimension,
        hierarchy: property.name
      }
    case AggregationRole.level:
      return {
        dimension: property.dimension,
        hierarchy: property.hierarchy,
        level: property.name
      }
    default:
      throw new Error(`Can't find dimension for '${dimension.hierarchy || dimension.dimension}'`)
  }
}

export function tryFixAnalyticsAnnotation(entityType: EntityType, analytics: AnalyticsAnnotation) {
  return (
    analytics && {
      ...analytics,
      rows: analytics.rows?.map((d: any) => tryFixDimension(entityType, d)),
      columns: analytics.columns?.map((d: any) => tryFixDimension(entityType, d))
    }
  )
}
