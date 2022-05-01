import {
  EntityType,
  FilterOperator,
  getEntityProperty,
  getPropertyName,
  IFilter,
  IMember,
  isFilter,
  ISlicer,
} from '@metad/ocap-core'
import { flatten, isArray, isNumber, isString } from 'lodash'
import { serializeName } from './types'

export function convertFiltersToSQL(filters: Array<IFilter>, entityType: EntityType, dialect: string) {
  return flatten(filters.map((item) => convertFilterToSQL(item, entityType, dialect)))
    .join(' AND ')
}

export function convertSlicerToSQL(iSlicer: ISlicer, dialect: string) {
  return `${iSlicer.dimension.dimension} ${iSlicer.exclude ? 'NOT ' : ''}IN (${iSlicer.members
    .map(convertFilterValue)
    .join(',')})`
}

export function convertFilterToSQL(slicer: ISlicer, entityType: EntityType, dialect: string) {

  // if (isAdvancedFilter(slicer)) {
  //   return slicer.children.map(child => `( ${convertFilterToSQL(child, entityType, dialect)} )`).join(slicer.filteringLogic === FilteringLogic.And ? ' AND ' : ' OR ')
  // }

  const propertyName = getPropertyName(slicer.dimension)
  const property = getEntityProperty(entityType, propertyName)
  const path = property.entitySet
    ? `${serializeName(property.entitySet, dialect)}.${serializeName(
        propertyName.replace(property.entitySet + '_', ''),
        dialect
      )}`
    : `${serializeName(entityType.name, dialect)}.${serializeName(propertyName, dialect)}`

  if (isFilter(slicer)) {
    switch (slicer.operator) {
      case FilterOperator.EQ:
        if (isArray(slicer.members)) {
          return `${path} IN (${slicer.members.map(convertFilterValue).join(',')})`
        }
        return `${path} = ${convertFilterValue(slicer.members[0])}`
      case FilterOperator.NE:
        if (isArray(slicer.members)) {
          return `${path} NOT IN (${slicer.members.map(convertFilterValue).join(',')})`
        }
        return `${path} <> ${convertFilterValue(slicer.members)}`
      case FilterOperator.BT:
        return `${path} BETWEEN ${convertFilterValue(slicer.members[0])} AND ${convertFilterValue(slicer.members[1])}`
      default:
        console.warn(`Error: unplemented slicer`, slicer)
        return '++++ Error: unplemented slicer ++++'
    }
  }

  const inOperator = slicer.exclude ? 'NOT IN' : 'IN'

  return `${path} ${inOperator} (${slicer.members.map(convertFilterValue).join(',')})`
}

export function convertFilterValue({ value }: IMember) {
  // if (isDate(value)) {
  //   return `datetime'${format(value as unknown as Date, HTML5_FMT_DATETIME_LOCAL_SECONDS)}'`
  // }
  if (isNumber(value)) {
    return value
  }

  if (isString(value)) {
    if (value.startsWith('datetime')) {
      return value
    }

    if (value === '') {
      return `'${value}'`
    }

    // escaping single quote
    return `'${value.replace(/'/g, "''")}'`
  }

  return `null`
}
