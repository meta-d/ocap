import {
  AdvancedSlicer,
  AggregationRole,
  EntityType,
  getEntityProperty,
  getPropertyName,
  getPropertyTextName,
  isAdvancedSlicer,
  isCalculationProperty,
  isMeasure,
  isUnbookedData,
  MDX,
  Property,
  QueryOptions
} from '@metad/ocap-core'
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

  let queryContext: SQLQueryContext = {} as SQLQueryContext

  queryContext.rows =
    options.rows?.map((field) => {
      const property = getEntityProperty(entityType, field)
      if (!property) {
        throw new Error(`Can't found Entity Property for field '${getPropertyName(field)}'`)
      }
      return {
        dimension: field,
        property
      }
    }) || []

  queryContext.columns =
    options.columns?.map((field) => {
      const property = getEntityProperty(entityType, field)
      if (!property) {
        throw new Error(`Can't found Entity Property for field '${getPropertyName(field)}'`)
      }

      return {
        dimension: field,
        property: getEntityProperty(entityType, field)
      }
    }) || []

  options.selects?.forEach((field) => {
    const property = getEntityProperty(entityType, field)

    if (!property) {
      throw new Error(`Can't found Entity Property for field '${getPropertyName(field)}'`)
    }

    if (property.role === AggregationRole.dimension) {
      queryContext.rows.push({
        dimension: field,
        property
      })
    } else {
      queryContext.columns.push({
        dimension: field,
        property
      })
    }
  })

  queryContext.dialect = dialect
  queryContext.zeroSuppression = isZeroSuppression(queryContext)

  queryContext = serializeSelectFields(queryContext)

  // const row = generateSelectFields(queryContext.rows, dialect)
  // const column = generateSelectFields(queryContext.columns, dialect)

  const groupby = union(queryContext.groupbys).join(',')

  const fromSource = serializeFrom(entityType, dialect)

  let statement = `SELECT ${isEmpty(queryContext.select) ? '*' : queryContext.select.join(`, `)} FROM ${fromSource}`

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

  const unbookedData = compact(queryContext.unbookedData)
  if (!isEmpty(unbookedData)) {
    filterString = (filterString ? `${filterString} AND ` : '') + unbookedData.join(' AND ')
  }
  if (!isEmpty(queryContext.where)) {
    filterString = (filterString ? `${filterString} AND ` : '') + queryContext.where.join(' AND ')
  }
  if (!isEmpty(queryContext.where)) {
    filterString = (filterString ? `${filterString} AND ` : '') + queryContext.where.join(' AND ')
  }
  if (filterString) {
    statement = statement + ` WHERE ${filterString}`
  }

  if (groupby) {
    statement = statement + ` GROUP BY ${groupby}`
  }
  if (!isEmpty(options?.orderbys)) {
    statement = statement + ` ${OrderBy(serializeOrderbys(options.orderbys, queryContext, dialect))}`
  }

  if (!isEmpty(conditions)) {
    console.warn(conditions.forEach((item) => serializeCondition(item, [...queryContext.rows, ...queryContext.columns])))
  }

  if (options.paging?.top) {
    statement = `${statement} ${serializeTopCount(options)}`
  }

  return statement
}

// export function generateSelectFields(rows: Array<SQLQueryProperty>, dialect: string): SQLQueryContext {
//   const fields = []
//   const groupbys = []
//   let zeroSuppression = false
//   const unbookedData = []
//   const where = []

//   rows.forEach(({ dimension, property }) => {
//     if (isMeasure(dimension)) {
//       const [field, conditions = []] = serializeProperty(property, dialect)
//       where.push(...conditions)
//       fields.push(`${field} AS ${serializeName(property.name, dialect)}`)
//     } else {
//       if (dimension.zeroSuppression) {
//         zeroSuppression = true
//       }
//       groupbys.push(serializeName(property.name, dialect))
//       fields.push(serializeName(property.name, dialect))
//       if (!isUnbookedData(dimension)) {
//         unbookedData.push(`${serializeName(property.name, dialect)} IS NOT NULL`)
//       }

//       const textName = getPropertyTextName(property)
//       if (textName) {
//         groupbys.push(serializeName(textName, dialect))
//         fields.push(serializeName(textName, dialect))
//       }
//     }
//   })

//   return { select: fields, groupbys, zeroSuppression, unbookedData, where } as SQLQueryContext
// }

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

export function isZeroSuppression(context: SQLQueryContext) {
  let zeroSuppression = false
  context.rows.forEach(({ dimension }) => {
    if (!isMeasure(dimension)) {
      if (dimension.zeroSuppression) {
        zeroSuppression = true
      }
    }
  })
  context.columns.forEach(({ dimension }) => {
    if (!isMeasure(dimension)) {
      if (dimension.zeroSuppression) {
        zeroSuppression = true
      }
    }
  })
  return zeroSuppression
}

export function serializeSelectFields(context: SQLQueryContext): SQLQueryContext {
  const fields = []
  const groupbys = context.groupbys ?? []
  const zeroSuppression = context.zeroSuppression
  const unbookedData = []
  const where = []
  const dialect = context.dialect;

  [...context.rows, ...context.columns].forEach(({ dimension, property }) => {
    if (isMeasure(dimension)) {
      const [field, conditions = []] = serializeProperty(property, dialect)
      where.push(...conditions)
      fields.push(`${field} AS ${serializeName(property.name, dialect)}`)

      if (zeroSuppression) {
        unbookedData.push(`${serializeName(property.name, dialect)} IS NOT NULL`)
      }
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

  return { ...context, select: fields, groupbys, zeroSuppression, unbookedData, where } as SQLQueryContext
}