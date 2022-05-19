import {
  AdvancedSlicer,
  AggregationRole,
  Cube,
  EntityProperty,
  EntityType,
  getEntityProperty,
  getPropertyName,
  getPropertyTextName,
  isAdvancedSlicer,
  isCalculationProperty,
  isMeasure,
  isPropertyMeasure,
  isUnbookedData,
  PropertyDimension,
  QueryOptions,
  Schema
} from '@metad/ocap-core'
import { compact, concat, isArray, isEmpty, negate, union } from 'lodash'
import { serializeCalculationProperty } from './calculation'
import { OrderBy } from './functions'
import { convertFiltersToSQL } from './sql-filter'
import { serializeName, SQLQueryContext, SQLQueryProperty } from './types'

export function getFirstElement<T>(objOrArray: T | T[]): T {
  return isArray(objOrArray) ? objOrArray[0] : objOrArray
}

export function serializeFrom(cube: Cube, entityType: EntityType, dialect: string) {
  const expression = cube.expression || serializeCubeFact(cube, dialect)
  return `(${expression}) AS ${serializeName(entityType.name, dialect)}`
}

export function serializeDimensionFrom(dimension: PropertyDimension, entityType: EntityType, dialect: string) {
  const cubeFact = serializeCubeFact(dimension, dialect)

  const expression = entityType.expression ?? cubeFact
  return `(${expression}) AS ${serializeName(entityType.name, dialect)}`
}

export function serializeCubeFact(cube: Cube, dialect?: string) {
  const factTable = cube.tables[0]

  let statement = `"${factTable.name}"`
  const tableNames = [factTable.name]
  cube.tables.slice(1).forEach((table) => {
    const exists = tableNames.filter((name) => name === table.name)
    const tableAlias = exists.length ? `${table.name}(${exists.length})` : table.name
    const conditions = table.join.fields
      .map((field) => `"${factTable.name}"."${field.leftKey}" = "${tableAlias}"."${field.rightKey}"`)
      .join(' AND ')
    statement = `${statement} ${table.join.type} JOIN "${table.name}" AS "${tableAlias}" ON ${conditions}`

    tableNames.push(table.name)
  })

  return `SELECT * FROM ${statement}`
}

export function queryCube(schema: Schema, options: QueryOptions, entityType: EntityType, dialect: string) {
  console.log(`~~~~~~~~~~~~~`, schema, options, entityType, `~~~~~~~~~~~~~~~~~~`)

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

  queryContext = serializeSelectFields(queryContext, entityType)

  // const row = generateSelectFields(queryContext.rows, dialect)
  // const column = generateSelectFields(queryContext.columns, dialect)

  const groupby = union(queryContext.groupbys).join(',')

  let fromSource = `"${entityType.name}"`
  const cube = schema?.cubes?.find(({ name }) => name === entityType.name)
  if (cube) {
    fromSource = serializeFrom(cube, entityType, dialect)
  } else {
    const dimension = schema?.dimensions?.find(({ name }) => name === entityType.name)
    if (dimension) {
      fromSource = serializeDimensionFrom(dimension, entityType, dialect)
    }
  }

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
    filterString = (filterString ? `${filterString} AND ` : '') + `(${unbookedData.join(' OR ')})`
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
    console.warn(
      conditions.forEach((item) => serializeCondition(item, [...queryContext.rows, ...queryContext.columns]))
    )
  }

  if (options.paging?.top) {
    statement = `${statement} ${serializeTopCount(options)}`
  }

  return statement
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

export function serializeSelectFields(context: SQLQueryContext, entityType: EntityType): SQLQueryContext {
  const fields = []
  const groupbys = context.groupbys ?? []
  const zeroSuppression = context.zeroSuppression
  const unbookedData = []
  const where = []
  const dialect = context.dialect

  const columns = [...context.rows, ...context.columns]

  let hasMeasure = false

  columns.forEach(({ dimension, property }) => {
    if (isMeasure(dimension)) {
      const alias = serializeName(property.name, dialect)
      const { statement, isAggregate } = serializeProperty(property, dialect)
      fields.push(`${statement} AS ${alias}`)
      if (isAggregate) {
        hasMeasure = true
      }
    }
  })

  columns.forEach(({ dimension, property }) => {
    const alias = serializeName(property.name, dialect)
    if (!isMeasure(dimension)) {
      if (hasMeasure) {
        groupbys.push(serializeName(property.name, dialect))
      }
      const statement = serializeDProperty(property, dialect)
      fields.push(`${statement} AS ${alias}`)
      if (!isUnbookedData(dimension)) {
        unbookedData.push(`${serializeName(property.name, dialect)} IS NOT NULL`)
      }

      const textName = getPropertyTextName(property)
      const textProperty = getEntityProperty(entityType, textName)
      if (textProperty) {
        if (hasMeasure) {
          groupbys.push(serializeName(textName, dialect))
        }
        const alias = serializeName(textProperty.name, dialect)
        const statement = serializeDProperty(textProperty, dialect)
        fields.push(`${statement} AS ${alias}`)
      }
    }
  })

  return { ...context, select: fields, groupbys, zeroSuppression, unbookedData, where } as SQLQueryContext
}

export function serializeProperty(property: EntityProperty, dialect?: string) {
  if (isPropertyMeasure(property)) {
    if (isCalculationProperty(property)) {
      return {
        statement: serializeCalculationProperty(property, dialect)
      }
    } else {
      const content = serializeName(property.name, dialect)
      if (!property.dataType || property.dataType === 'number') {
        return {
          statement: `SUM(${content})`,
          isAggregate: true
        }
      } else {
        return {
          statement: `${content}`,
          isAggregate: false
        }
      }
    }
  }

  return {
    statement: serializeDProperty(property, dialect),
    isAggregate: false
  }
}

export function serializeDProperty(property: PropertyDimension, dialect?: string): string {
  // 计算度量作为维度来用时
  if (isCalculationProperty(property)) {
    return serializeCalculationProperty(property, dialect)
  }

  dialect = property.keyExpression?.sql?.dialect ?? dialect
  if (property.keyExpression?.sql?.content) {
    return `${property.keyExpression?.sql?.content}`
  }

  return serializeName(property.column ?? property.name, dialect)
}
