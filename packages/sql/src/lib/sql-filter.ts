import {
  EntityType,
  FilteringLogic,
  FilterOperator,
  getPropertyName,
  IFilter,
  IMember,
  isAdvancedFilter,
  isFilter,
  ISlicer
} from '@metad/ocap-core'
import compact from 'lodash/compact'
import flatten from 'lodash/flatten'
import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'
import isNumber from 'lodash/isNumber'
import isString from 'lodash/isString'
import { CubeContext } from './cube'
import { createDimensionContext } from './dimension'
import { serializeName } from './types'

/**
 * 依据实体类型将过滤器转换成语句
 *
 * @param filters 过滤器
 * @param entityType 实体类型
 * @param dialect 方言
 * @returns 过滤语句
 */
export function convertFiltersToSQL(filters: Array<IFilter>, entityType: EntityType, dialect?: string) {
  return compact(flatten(filters.map((item) => convertFilterToSQL(item, entityType, dialect)))).join(' AND ')
}

export function convertSlicerToSQL(iSlicer: ISlicer, dialect?: string) {
  if (isEmpty(iSlicer.members)) {
    return ''
  }

  return `${iSlicer.dimension.dimension} ${iSlicer.exclude ? 'NOT ' : ''}IN (${iSlicer.members
    .map(convertFilterValue)
    .join(',')})`
}

export function convertFilterToSQL(slicer: ISlicer, entityType: EntityType, dialect: string) {
  if (isAdvancedFilter(slicer)) {
    return slicer.children
      .map((child) => `( ${convertFilterToSQL(child, entityType, dialect)} )`)
      .join(slicer.filteringLogic === FilteringLogic.And ? ' AND ' : ' OR ')
  }

  if (isEmpty(slicer.members)) {
    return ''
  }

  const propertyName = getPropertyName(slicer.dimension)
  // const property = getEntityProperty(entityType, propertyName)

  const path = `${serializeName(entityType.name, dialect)}.${serializeName(propertyName, dialect)}`
  // property.entitySet
  //   ? `${serializeName(property.entitySet, dialect)}.${serializeName(
  //       propertyName.replace(property.entitySet + '_', ''),
  //       dialect
  //     )}`
  //   : `${serializeName(entityType.name, dialect)}.${serializeName(propertyName, dialect)}`

  if (isFilter(slicer)) {
    switch (slicer.operator) {
      case FilterOperator.EQ:
        if (isArray(slicer.members)) {
          return `${path} IN (${slicer.members.map(convertFilterValue).join(', ')})`
        }
        return `${path} = ${convertFilterValue(slicer.members[0])}`
      case FilterOperator.NE:
        if (isArray(slicer.members)) {
          return `${path} NOT IN (${slicer.members.map(convertFilterValue).join(', ')})`
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

  return `${path} ${inOperator} (${slicer.members.map(convertFilterValue).join(', ')})`
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

export const MEMBER_VALUE_REGEX = new RegExp('\\[(.*?)\\]', 'g')

export function compileSlicer(slicer: ISlicer, entityType: EntityType, cube: CubeContext, dialect: string) {
  const factTable = cube.factTable
  let dimensionContext = cube.dimensions.find((item) => item.dimension.dimension === slicer.dimension.dimension)
  if (!dimensionContext) {
    dimensionContext = createDimensionContext(entityType, slicer.dimension)
    dimensionContext.factTable = factTable
    cube.dimensions.push(dimensionContext)
  }

  if (dimensionContext.hierarchy.name !== (slicer.dimension.hierarchy || slicer.dimension.dimension)) {
    throw new Error(`不能同时查询不同层级结构${dimensionContext.hierarchy.name}和${slicer.dimension.hierarchy || slicer.dimension.dimension}`)
  }

  const levels = dimensionContext.hierarchy.levels.slice(dimensionContext.hierarchy.hasAll ? 1 : 0)

  return slicer.members
    .map((member) => {
      return [...`${member.value}`.matchAll(MEMBER_VALUE_REGEX)]
        .map((item) => item[1])
        .map((value, i) => {
          const level = levels[i]
          return `${serializeName(level.table || dimensionContext.dimensionTable || factTable, dialect)}.${serializeName(
            level.nameColumn || level.column,
            dialect
          )} = '${value}'`
        })
        .join(' AND ')
    })
    .filter((value) => !!value)
    .map((memberStr) => (slicer.exclude ? `NOT (${memberStr})` : `(${memberStr})`))
    .join(slicer.exclude ? ' AND ' : ' OR ')
}

export function compileFilters(filters: Array<IFilter>, entityType: EntityType, cube: CubeContext, dialect?: string) {
  return compact(flatten(filters.map((item) => compileSlicer(item, entityType, cube, dialect)))).join(' AND ')
}
