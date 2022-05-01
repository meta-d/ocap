import { AdvancedSlicer, AggregationRole, EntityType, getEntityProperty, getPropertyTextName, isAdvancedSlicer, isCalculationProperty, isMeasure, isUnbookedData, MDX, Property, QueryOptions } from '@metad/ocap-core'
import { compact, concat, isArray, isEmpty, negate, union } from 'lodash'
import { serializeCalculationProperty } from './calculation'
import { OrderBy } from './functions'
import { convertFiltersToSQL } from './sql-filter'
import { serializeName, SQLQueryContext, SQLQueryProperty } from './types'

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


export function queryCube(cubes: MDX.Cube[], options: QueryOptions, entityType: EntityType, dialect: string) {
  console.log(cubes, options, entityType)

  const rows: Array<SQLQueryProperty> =
    options.rows?.map((field) => ({
      dimension: field,
      property: getEntityProperty(entityType, field)
    })) || []
    
  const columns: Array<SQLQueryProperty> =
    options.columns?.map((field) => ({
      dimension: field,
      property: getEntityProperty(entityType, field)
    })) || []

  options.selects?.forEach((field) => {
    const property = getEntityProperty(entityType, field)
    if (property.role === AggregationRole.dimension) {
      rows.push({
        dimension: field,
        property
      })
    } else {
      columns.push({
        dimension: field,
        property
      })
    }
  })

  const row = generateSelectFields(rows, dialect)
  const column = generateSelectFields(columns, dialect)

  const groupby = union(row.groupbys, column.groupbys).join(',')

  const fromSource = serializeFrom(entityType, dialect)
  const fields = union(row.select, column.select)

  let statement = `SELECT ${isEmpty(fields) ? '*' : fields.join(`, `)} FROM ${fromSource}`

  // Conditions
  const conditions: Array<AdvancedSlicer> = []

  let filterString = options.filterString || ''
  if (negate(isEmpty)(options.filters)) {
    const filters = []
    options.filters.forEach((item) => {
      if (isAdvancedSlicer(item)) {
        conditions.push(item)
      } else {
        filters.push(item)
      }
    })
    if (negate(isEmpty)(filters)) {
      filterString = (filterString ? `${filterString} AND ` : '') + convertFiltersToSQL(filters, entityType, dialect)
    }
  }

  // 无值数据

  const unbookedData = compact([...row.unbookedData, ...column.unbookedData])
  if (!isEmpty(unbookedData)) {
    filterString = (filterString ? `${filterString} AND ` : '') + unbookedData.join(' AND ')
  }
  if (!isEmpty(row.where)) {
    filterString = (filterString ? `${filterString} AND ` : '') + row.where.join(' AND ')
  }
  if (!isEmpty(column.where)) {
    filterString = (filterString ? `${filterString} AND ` : '') + column.where.join(' AND ')
  }
  if (filterString) {
    statement = statement + ` WHERE ${filterString}`
  }

  if (groupby) {
    statement = statement + ` GROUP BY ${groupby}`
  }
  if (!isEmpty(options?.orderbys)) {
    statement = statement + ` ${OrderBy(serializeOrderbys(options.orderbys, { rows, columns }, dialect))}`
  }

  if (!isEmpty(conditions)) {
    console.warn(conditions.forEach((item) => serializeCondition(item, [...rows, ...columns])))
  }

  if (options.paging?.top) {
    statement = `${statement} ${serializeTopCount(options)}`
  }

  return statement
}


export function generateSelectFields(rows: Array<SQLQueryProperty>, dialect: string): SQLQueryContext {
  const fields = []
  const groupbys = []
  const unbookedData = []
  const where = []

  rows.forEach(({ dimension, property }) => {
    if (isMeasure(dimension)) {
      const [field, conditions = []] = serializeProperty(property, dialect)
      where.push(...conditions)
      fields.push(`${field} AS ${serializeName(property.name, dialect)}`)
    } else {
      groupbys.push(serializeName(property.name, dialect))
      fields.push(serializeName(property.name, dialect))
      if (!isUnbookedData(dimension)) {
        unbookedData.push(`${serializeName(property.name, dialect)} IS NOT NULL`)
      }

      const textName = getPropertyTextName(property)
      if (textName) {
        groupbys.push(serializeName(textName, dialect))
        fields.push(serializeName(textName, dialect))
      }
    }
  })

  return { select: fields, groupbys, unbookedData, where }
}


/**
 * 生成 Property 字段对应的 SQL 语句表达式
 * @param property
 * @returns
 */
 function serializeProperty(property: Property, dialect: string) {
  if (isCalculationProperty(property)) {
    return serializeCalculationProperty(property, dialect)
  }

  // measure 默认为 sum 聚合
  return [`SUM(${serializeName(property.name, dialect)})`]
}

export function serializeCondition(condition: AdvancedSlicer, context: Array<SQLQueryProperty>) {
  return ``
}

export function serializeTopCount(options) {
  return `LIMIT ${options.paging.top}`
}

export function serializeOrderbys(orderbys, { rows, columns }, dialect: string) {
  const fields = concat(rows, columns)
  return orderbys
    .filter(({ by }) => fields.find((item) => item.property.name === by))
    .map(({ by, order }) => `${serializeName(by, dialect)}${order ? ` ${order}` : ''}`)
}
