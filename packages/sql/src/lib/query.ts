import {
  AdvancedSlicer,
  Cube,
  C_MEASURES,
  EntityType,
  IntrinsicMemberProperties,
  isAdvancedSlicer,
  isCalculatedProperty,
  isMeasure,
  PivotColumn,
  PropertyMeasure,
  QueryOptions,
  Schema,
  wrapHierarchyValue
} from '@metad/ocap-core'
import concat from 'lodash/concat'
import flatten from 'lodash/flatten'
import isArray from 'lodash/isArray'
import { buildCubeContext, CubeContext } from './cube'
import {
  queryDimension,
  serializeColumn,
  serializeGroupByDimensions,
  serializeHierarchyFrom,
  serializeTablesJoin
} from './dimension'
import { compileFilters } from './sql-filter'
import { SQLQueryContext, SQLQueryProperty } from './types'
import { serializeName, serializeTableAlias } from './utils'

export function getFirstElement<T>(objOrArray: T | T[]): T {
  return isArray(objOrArray) ? objOrArray[0] : objOrArray
}

export function serializeFrom(cube: Cube, entityType: EntityType, dialect: string) {
  const expression = cube.expression || serializeCubeFact(cube, dialect)
  return `(${expression}) AS ${serializeName(entityType.name, dialect)}`
}

export function serializeCubeFact(cube: Cube, dialect: string) {
  const factTable = cube.tables[0]

  let statement = serializeName(factTable.name, dialect)
  const tableNames = [factTable.name]
  cube.tables.slice(1).forEach((table) => {
    const exists = tableNames.filter((name) => name === table.name)
    const tableAlias = exists.length ? `${table.name}(${exists.length})` : table.name
    const conditions = table.join.fields
      .map(
        (field) =>
          `${serializeName(factTable.name, dialect)}.${serializeName(field.leftKey, dialect)} = ${serializeName(
            tableAlias,
            dialect
          )}.${serializeName(field.rightKey, dialect)}`
      )
      .join(' AND ')
    statement = `${statement} ${table.join.type} JOIN ${serializeName(table.name, dialect)} AS ${serializeName(
      tableAlias,
      dialect
    )} ON ${conditions}`

    tableNames.push(table.name)
  })

  return `SELECT * FROM ${statement}`
}

export function serializeMeasure(fact: string, measure: PropertyMeasure & { alias: string }, dialect: string) {
  if (isCalculatedProperty(measure)) {
    return `(${measure.formula}) AS ${serializeName(measure.alias, dialect)}`
  }

  return `${measure.aggregator || 'SUM'}(${
    typeof measure.column === 'number'
      ? measure.column
      : serializeName(fact, dialect) + '.' + serializeName(measure.column, dialect)
  }) AS ${serializeName(measure.alias, dialect)}`
}

/**
 *
 * @param schema
 * @param options
 * @param entityType
 * @param catalog 数据源目录, 对应如 hive 的 schemaName
 * @param dialect
 * @returns
 */
export function queryCube(
  schema: Schema,
  options: QueryOptions,
  entityType: EntityType,
  dialect: string,
  catalog?: string
) {
  const dimension = schema?.dimensions?.find((item) => item.name === entityType.name)
  if (dimension) {
    return { statement: queryDimension(dimension, entityType, options, dialect, catalog) }
  }

  const cube = schema?.cubes?.find((item) => item.name === entityType.name)

  if (!cube) {
    throw new Error(`未找到模型'${entityType.name}'`)
  }

  const cubeContext: CubeContext = buildCubeContext(cube, options, entityType, dialect)
  // Compile Slicers
  const conditions = []
  cubeContext.filterString = options.filterString || ''
  if (options.filters?.length) {
    const filters = []
    options.filters.forEach((item) => {
      if (isAdvancedSlicer(item)) {
        conditions.push(item)
      } else {
        filters.push(item)
      }
    })
    if (filters.length) {
      cubeContext.filterString +=
        (cubeContext.filterString ? ` AND ` : '') + compileFilters(filters, entityType, cubeContext, dialect)
    }
  }

  // 排列组合每个 Dimension 下需要计算的 Levels
  let levels = []
  cubeContext.dimensions
    .filter(({ dimension }) => dimension.dimension !== C_MEASURES)
    .forEach((dimensionContext) => {
      const _levels = levels.length ? [...levels] : [{ ...cubeContext, dimensions: [] }]
      levels = []

      if (dimensionContext.levels?.length) {
        dimensionContext.levels?.forEach((level) => {
          levels.push(
            ..._levels.map((context) => {
              return {
                ...context,
                dimensions: [
                  ...context.dimensions,
                  {
                    ...dimensionContext,
                    level: level.level,
                    selectFields: level.selectFields
                  }
                ]
              }
            })
          )
        })
      } else {
        levels.push(
          ..._levels.map((context) => ({
            ...context,
            dimensions: [
              ...context.dimensions,
              {
                ...dimensionContext
              }
            ]
          }))
        )
      }
    })

  let statement =
    levels.map((cubeContext) => serializeLevelSelect(cubeContext, dialect, catalog)).join(' union ') ||
    serializeLevelSelect(cubeContext, dialect, catalog)

  if (options.paging?.top || options.orderbys?.length) {
    statement = `SELECT * FROM (${statement}) AS LIMIT_ALIAS`
    if (options.orderbys?.length) {
      statement =
        `${statement} ORDER BY ` +
        options.orderbys
          .map((orderBy) => serializeName(orderBy.by, dialect) + ' ' + (orderBy.order || 'ASC'))
          .join(', ')
    }
    if (options.paging?.top) {
      statement = `${statement} LIMIT ${options.paging.top}`
    }
  }

  return { cubeContext, statement }
}

export function serializeLevelSelect(cubeContext: CubeContext, dialect: string, catalog: string) {
  const cube = cubeContext.schema
  const dimensionsStatement = cubeContext.dimensions
    .map((dimensionContext) => {
      return dimensionContext.selectFields?.map((field) => serializeColumn(field, dialect)).join(', ')
    })
    .filter((statement) => !!statement)
    .join(', ')

  let statement
  if (cubeContext.measures.length) {
    // fact table in cube
    const fact = serializeTableAlias(cube.name, cube.tables[0].name)
    statement =
      dimensionsStatement +
      (dimensionsStatement ? ', ' : '') +
      cubeContext.measures.map((measure: any) => serializeMeasure(fact, measure, dialect)).join(', ')
  }

  // Compile cube and dimensions
  statement += ` FROM ` + serializeCubeFrom(cubeContext, dialect, catalog)
  // Where slicers
  if (cubeContext.filterString) {
    statement += ' WHERE ' + cubeContext.filterString
  }
  // Aggregate Dimensions
  const groupByStatement = serializeGroupByDimensions(cubeContext.dimensions, dialect) || (dimensionsStatement ? 1 : '')
  if (groupByStatement) {
    statement += ` GROUP BY ` + groupByStatement
  }

  return `SELECT ` + statement
}

export function serializeCubeFrom(cubeContext: CubeContext, dialect: string, catalog?: string): string {
  return (
    serializeTablesJoin(cubeContext.schema.name, cubeContext.schema.tables, dialect, catalog) +
    cubeContext.dimensions
      .filter((dimensionContext) => !!dimensionContext.dimensionTable)
      .map((dimensionContext) => {
        const primaryKeyTable = dimensionContext.hierarchy.primaryKeyTable || dimensionContext.hierarchy.tables[0].name
        return (
          ` INNER JOIN ` +
          serializeHierarchyFrom('', dimensionContext.hierarchy, dialect, catalog) +
          ` ON ${serializeName(cubeContext.factTable, dialect)}.${serializeName(
            dimensionContext.schema.foreignKey,
            dialect
          )} = ${serializeName(
            serializeTableAlias(dimensionContext.hierarchy.name, primaryKeyTable),
            dialect
          )}.${serializeName(dimensionContext.hierarchy.primaryKey, dialect)}`
        )
      })
      .join('')
  )
}

export function serializeCondition(condition: AdvancedSlicer, context: Array<SQLQueryProperty>) {
  return ``
}

export function serializeTopCount(options) {
  return `LIMIT ${options.paging.top}`
}

export function serializeOrderbys(orderbys, { rows, columns }: SQLQueryContext, dialect: string) {
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

export function transposePivot(cubeContext: CubeContext, data: Array<any>) {
  const rowContexts = cubeContext.dimensions.filter((context) => context.role === 'row')
  const columnContexts = cubeContext.dimensions.filter((context) => context.role === 'column')
  let recursiveHierarchy
  let rowHierarchy
  const hRow = rowContexts?.find((row) => row.dimension.displayHierarchy)
  if (hRow) {
    rowHierarchy = hRow.hierarchy.name
    recursiveHierarchy = {
      parentNodeProperty: wrapHierarchyValue(hRow.keyColumn, IntrinsicMemberProperties.PARENT_UNIQUE_NAME),
      valueProperty: hRow.keyColumn
    }
  }

  if (!columnContexts.length) {
    return { data, schema: { recursiveHierarchy, rowHierarchy } }
  }

  const columns: PivotColumn[] = []
  const columnsKeyMap = {}

  const results = []
  const resultKeyMap = {}
  data.forEach((item) => {
    // Backward compatibility for dimension name property
    rowContexts.forEach(({schema, dimension, keyColumn, captionColumn}) => {
      item[dimension.dimension] = item[keyColumn]
      item[schema.caption] = item[captionColumn]
    })
    const rowKey = rowContexts.map(({ keyColumn }) => item[keyColumn]).join('')
    if (!resultKeyMap[rowKey]) {
      resultKeyMap[rowKey] = item
      results.push(item)
    }

    let parents = [null]
    columnContexts.forEach(
      ({ keyColumn, captionColumn, parentKeyColumn, childrenCardinalityColumn, dimension, members }, key, arr) => {
        parents.forEach((parent) => {
          let parentColumns = parent?.columns ?? columns
          if (isMeasure(dimension)) {
            members.forEach((member) => {
              const keyColumn = member.value
              const columnName = (parent?.name ? parent.name + '/' : '') + keyColumn
              if (!columnsKeyMap[columnName]) {
                columnsKeyMap[columnName] = {
                  name: columnName,
                  label: member.label || member.value,
                  uniqueName: keyColumn,
                  measure: keyColumn,
                  columns: []
                }

                parentColumns.push(columnsKeyMap[columnName])
              }

              if (Object.is(arr.length - 1, key)) {
                const measure = columnsKeyMap[columnName].measure ?? cubeContext.schema.defaultMeasure
                resultKeyMap[rowKey][columnName] = item[measure]
              }
            })
          } else {
            const columnName = (parent?.name ? parent.name + '/' : '') + item[keyColumn]
            if (!columnsKeyMap[columnName]) {
              columnsKeyMap[columnName] = {
                name: columnName,
                label: item[captionColumn],
                uniqueName: item[keyColumn],
                parentUniqueName: item[parentKeyColumn],
                childrenCardinality: item[childrenCardinalityColumn],
                measure: parent?.measure,
                columns: []
              }

              parentColumns.push(columnsKeyMap[columnName])
            }

            if (Object.is(arr.length - 1, key)) {
              const measure = columnsKeyMap[columnName].measure ?? cubeContext.schema.defaultMeasure
              resultKeyMap[rowKey][columnName] = item[measure]
            }

            parentColumns = columnsKeyMap[columnName].columns
          }
        })

        parents = flatten(parents.map((parent) => parent?.columns ?? columns))
      }
    )
  })

  console.log(columnsKeyMap, columns)

  return {
    data: results,
    schema: { recursiveHierarchy, rowHierarchy, columns }
    // rows: rowContexts.map(({keyColumn}) => keyColumn)
  }
}
