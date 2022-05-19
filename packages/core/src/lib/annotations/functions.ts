import { EntityType, getEntityDimensions, Property, PropertyHierarchy, PropertyLevel } from '../models'
import { Semantics } from './semantics'

export enum PeriodFunctions {
  CURRENT = 'CURRENT',
  /**
   * 年累计
   */
  YTD = 'YTD',
  /**
   * 季度累计
   */
  QTD = 'QTD',
  /**
   * 周累计
   */
  WTD = 'WTD',
  /**
   * 月累计
   */
  MTD = 'MTD',
  /**
   * 去年同期年累计
   */
  PYYTD = 'PYYTD',
  /**
   * 同比
   */
  YOY = 'YOY',
  /**
   * 同比差值（当期 - 去年同期）
   */
  YOYGAP = 'YOYGAP',
  /**
   * 环比
   */
  MOM = 'MOM',
  /**
   * 环比差值（当期 - 上期）
   */
  MOMGAP = 'MOMGAP',
  /**
   * 年累计环比
   */
  YTDOM = 'YTDOM',
  /**
   * 年累计同比
   */
  YTDOY = 'YTDOY',
  /**
   * 年累计同比差值
   */
  YTDOYGAP = 'YTDOYGAP',
  /**
   * 上期
   */
  MPM = 'MPM',
  /**
   * 上期同比
   */
  MPMYOY = 'MPMYOY',
  /**
   * 去年同期
   */
  PYSM = 'PYSM',
  /**
   * 去年同期同比
   */
  PYSMYOY = 'PYSMYOY'
}

export function getCalendarDimension(entityType: EntityType): Property {
  const timeDim = getEntityDimensions(entityType).find((property) => property.semantic === Semantics.Calendar)
  if (!timeDim) {
    throw new Error(`Can't found calendar dimension in entityType: ${entityType.name}`)
  }
  return timeDim
}

export function getCalendarHierarchy(entityType: EntityType): PropertyHierarchy {
  const timeDim = getCalendarDimension(entityType)
  const timeHierarchy = getDefaultHierarchy(timeDim)

  if (!timeHierarchy) {
    throw new Error(`Can't found calendar hierarchy in dimension: ${timeDim?.name}`)
  }

  return timeHierarchy
}

export function getDefaultHierarchy(property: Property) {
  const defaultHierarchy =
    property?.hierarchies?.find((hierarchy) => hierarchy.name === property.defaultHierarchy) ||
    property?.hierarchies?.[0]
  // if (!defaultHierarchy) {
  //     throw new Error(`Can't found default hierarchy in dimension: ${property?.name}`)
  // }
  return defaultHierarchy
}

export function getTimeYearLevel(hierarchy: PropertyHierarchy): PropertyLevel {
  return hierarchy.levels.find((item) => item.semantic === Semantics['Calendar.Year'])
}

export function getTimeQuarterLevel(hierarchy: PropertyHierarchy): PropertyLevel {
  const quarter = hierarchy.levels.find((item) => item.semantic === Semantics['Calendar.Quarter'])
  return quarter
}

export function getHierarchySemanticLevel(hierarchy: PropertyHierarchy, semantic: Semantics): PropertyLevel {
  return hierarchy?.levels?.find((item) => item.semantic === semantic)
}
