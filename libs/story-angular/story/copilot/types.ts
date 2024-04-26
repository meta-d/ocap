import {
  AggregationRole,
  AnalyticsAnnotation,
  C_MEASURES,
  Dimension,
  EntityType,
  Measure,
  PropertyDimension,
  PropertyLevel,
  getEntityProperty,
  getEntityProperty2,
  wrapBrackets
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

/**
 * @deprecated use tryFixDimension
 */
export function fixDimension(item: Dimension, entityType: EntityType) {
  if ((<Measure>item).measure) {
    return fixMeasure(item, entityType)
  }

  let { dimension, hierarchy, level } = item

  dimension = wrapBrackets(dimension)
  hierarchy = wrapBrackets(hierarchy)

  let property: PropertyLevel | PropertyDimension = getEntityProperty<PropertyDimension>(entityType, dimension)
  if (!property) {
    property = getEntityProperty2(entityType, dimension)
    dimension = property.dimension
    hierarchy = (<PropertyLevel>property).hierarchy ?? property.name
  }

  if (level) {
    property = getEntityProperty2(entityType, level)
    // Can't find level, set level to null
    if (!property) {
      level = null
    }
  }

  return {
    ...item,
    dimension,
    hierarchy,
    level
  }
}

export function fixMeasure(item: Measure | Dimension, entityType?: EntityType) {
  return {
    ...item,
    dimension: item.dimension === `[${C_MEASURES}]` ? C_MEASURES : item.dimension
  }
}
