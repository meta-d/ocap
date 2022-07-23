import {
  AdvancedSlicer,
  AggregationRole,
  Cube,
  EntityProperty,
  EntitySemantics,
  EntityType,
  getEntityProperty,
  getPropertyName,
  getPropertyCaption,
  isAdvancedSlicer, isCalculatedProperty,
  isCalculationProperty,
  isMeasure,
  isPropertyMeasure,
  isUnbookedData,
  PropertyDimension,
  PropertyMeasure,
  QueryOptions,
  Schema,
  PivotColumn,
  C_MEASURES,
  IntrinsicMemberProperties,
  wrapHierarchyValue
} from '@metad/ocap-core'
import compact from 'lodash/compact'
import concat from 'lodash/concat'
import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'
import negate from 'lodash/negate'
import union from 'lodash/union'
import { serializeCalculationProperty } from './calculation'
import { buildCubeContext, CubeContext } from './cube'
import {
  queryDimension,
  serializeColumn,
  serializeGroupByDimensions,
  serializeHierarchyFrom,
  serializeTablesJoin
} from './dimension'
import { OrderBy } from './functions'
import { compileFilters, convertFiltersToSQL } from './sql-filter'
import { SQLQueryContext, SQLQueryProperty } from './types'
import { serializeName, serializeTableAlias } from './utils'

export function getFirstElement<T>(objOrArray: T | T[]): T {
  return isArray(objOrArray) ? objOrArray[0] : objOrArray
}

export function serializeFrom(cube: Cube, entityType: EntityType, dialect: string) {
  const expression = cube.expression || serializeCubeFact(cube, dialect)
  return `(${expression}) AS ${serializeName(entityType.name, dialect)}`
}

// export function serializeDimensionFrom(dimension: PropertyDimension, entityType: EntityType, dialect: string) {
//   const cubeFact = serializeCubeFact(dimension, dialect)

//   const expression = cubeFact
//   return `(${expression}) AS ${serializeName(entityType.name, dialect)}`
// }

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

export function serializeMeasure(fact: string, measure: PropertyMeasure & {alias: string}, dialect: string) {
  if (isCalculatedProperty(measure)) {
    return `${measure.aggregator || 'SUM'}(${
        measure.formula
    }) AS ${serializeName(measure.alias, dialect)}`
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
export function queryCube(schema: Schema, options: QueryOptions, entityType: EntityType, dialect: string, catalog?: string) {
  const dimension = schema?.dimensions?.find((item) => item.name === entityType.name)
  if (dimension) {
    return {statement: queryDimension(dimension, entityType, options, dialect, catalog)}
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
      cubeContext.filterString += (cubeContext.filterString ? ` AND ` : '') + compileFilters(filters, entityType, cubeContext, dialect)
    }
  }

  // 排列组合每个 Dimension 下需要计算的 Levels
  let levels = []
  cubeContext.dimensions.filter(({dimension}) => dimension.dimension !== C_MEASURES).forEach((dimensionContext) => {
    const _levels = levels.length ? [...levels] : [{...cubeContext, dimensions: []}]
    levels = []
    
    if (dimensionContext.levels?.length) {
      dimensionContext.levels?.forEach((level) => {
        levels.push(..._levels.map((context) => {
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
        }))
      })
    } else {
      levels.push(..._levels.map((context) => ({
        ...context,
        dimensions: [
          ...context.dimensions,
              {
                ...dimensionContext,
              }
        ]
      })))
    }
  })
  
  const statement = levels.map((cubeContext) => serializeLevelSelect(cubeContext, dialect, catalog)).join(' union ')

  return {cubeContext, statement}
}

export function serializeLevelSelect(cubeContext: CubeContext, dialect: string, catalog: string) {
  const cube = cubeContext.schema
  let statement = cubeContext.dimensions
    .map((dimensionContext) => {
      return dimensionContext.selectFields
        .map((field) => serializeColumn(field, dialect))
        .join(', ')
    })
    .filter((statement) => !!statement)
    .join(', ')

  if (cubeContext.measures.length) {
    // fact table in cube
    const fact = serializeTableAlias(cube.name, cube.tables[0].name)
    statement +=
      ', ' +
      cubeContext.measures
        .map((measure: any) => serializeMeasure(fact, measure, dialect))
        .join(', ')
  }

  // Compile cube and dimensions
  statement += ` FROM ` + serializeCubeFrom(cubeContext, dialect, catalog)
  // Where slicers
  if (cubeContext.filterString) {
    statement += ' WHERE ' + cubeContext.filterString
  }
  // Aggregate Dimensions
  statement +=
    ` GROUP BY ` + (serializeGroupByDimensions(cubeContext.dimensions, dialect) || 1)

  return `SELECT ` + statement
}

export function serializeCubeFrom(cubeContext: CubeContext, dialect: string, catalog?: string): string {
  return (
    serializeTablesJoin(cubeContext.schema.name, cubeContext.schema.tables, dialect, catalog) +
    cubeContext.dimensions.filter((dimensionContext) => !!dimensionContext.dimensionTable)
        .map((dimensionContext) => {
          const primaryKeyTable = dimensionContext.hierarchy.primaryKeyTable || dimensionContext.hierarchy.tables[0].name
          return (
            ` INNER JOIN ` +
            serializeHierarchyFrom('', dimensionContext.hierarchy, dialect, catalog) +
            ` ON ${serializeName(cubeContext.factTable, dialect)}.${serializeName(
              dimensionContext.schema.foreignKey,
              dialect
            )} = ${serializeName(serializeTableAlias(dimensionContext.hierarchy.name, primaryKeyTable), dialect)}.${serializeName(
              dimensionContext.hierarchy.primaryKey,
              dialect
            )}`
          )
        })
        .join('')
  )
}

/**
 * 将查询条件根据运行时类型和原始模型编译成查询语句
 * @deprecated
 * 
 * @param schema
 * @param options
 * @param entityType
 * @param dialect
 * @returns
 */
export function queryCube2(schema: Schema, options: QueryOptions, entityType: EntityType, dialect: string) {
  const dimension = schema?.dimensions?.find((item) => item.name === entityType.name)
  if (dimension) {
    // return queryDimension(dimension, entityType, options, dialect,)
  }

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

  const fromSource = '' // From(entityType, schema, dialect)

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

/**
 * 将维度度量分配到不同的查询位置 Select Group Sort 等
 *
 * @param context
 * @param entityType
 * @returns
 */
export function serializeSelectFields(context: SQLQueryContext, entityType: EntityType): SQLQueryContext {
  const fields = []
  const groupbys = context.groupbys ?? []
  const zeroSuppression = context.zeroSuppression
  const unbookedData = []
  const where = []
  const dialect = context.dialect

  const columns = [...context.rows, ...context.columns]

  let hasMeasure = entityType.semantics === EntitySemantics.aggregate

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

      const textName = getPropertyCaption(property)
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

export function serializeProperty(property: EntityProperty, dialect: string) {
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

export function serializeDProperty(property: PropertyDimension, dialect: string): string {
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

// export function From(entityType: EntityType, schema: Schema, dialect: string, catalog: string) {
//   let fromSource = `${serializeName(entityType.name, dialect, catalog)}`
//   const cube = schema?.cubes?.find(({ name }) => name === entityType.name)
//   if (cube) {
//     fromSource = serializeFrom(cube, entityType, dialect)
//   } else {
//     const dimension = schema?.dimensions?.find(({ name }) => name === entityType.name)
//     if (dimension) {
//       fromSource = serializeDimensionFrom(dimension, entityType, dialect)
//     }
//   }

//   return fromSource
// }

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
    return {data, schema: {recursiveHierarchy, rowHierarchy}}
  }

  const columns: PivotColumn[] = []
  const columnsKeyMap = {}

  const results = []
  const resultKeyMap = {}
  data.forEach((item) => {
    const rowKey = rowContexts.map(({keyColumn}) => item[keyColumn]).join('')
    if (!resultKeyMap[rowKey]) {
      resultKeyMap[rowKey] = item
      results.push(item)
    }

    let parentColumns = columns
    let parent = null
    columnContexts.forEach(({keyColumn, captionColumn, parentKeyColumn, childrenCardinalityColumn, dimension}, key, arr) => {
      const columnName = (parent?.name ? parent.name + '/' : '') + (isMeasure(dimension) ? keyColumn : item[keyColumn])
      if (!columnsKeyMap[columnName]) {
        if (isMeasure(dimension)) {
          columnsKeyMap[columnName] = {
            name: columnName,
            label: keyColumn,
            uniqueName: keyColumn,
            measure: keyColumn,
            columns: []
          }
        } else {
          columnsKeyMap[columnName] = {
            name: columnName,
            label: item[captionColumn],
            uniqueName: item[keyColumn],
            parentUniqueName: item[parentKeyColumn],
            childrenCardinality: item[childrenCardinalityColumn],
            measure: parent?.measure,
            columns: []
          }
        }
        
        parentColumns.push(columnsKeyMap[columnName])
      }

      if (Object.is(arr.length - 1, key)) {
        const measure = columnsKeyMap[columnName].measure ?? cubeContext.schema.defaultMeasure
        resultKeyMap[rowKey][columnName] = item[measure]
      }

      parentColumns = columnsKeyMap[columnName].columns
      parent = columnsKeyMap[columnName]
    })
  })

  console.log(columnsKeyMap, columns)

  return {
    data: results,
    schema: {recursiveHierarchy, rowHierarchy, columns}
    // rows: rowContexts.map(({keyColumn}) => keyColumn)
  }
}