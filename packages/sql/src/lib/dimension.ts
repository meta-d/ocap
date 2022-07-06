import {
  AggregationRole,
  Dimension,
  EntityType,
  getEntityHierarchy,
  getEntityProperty,
  isMeasure,
  PropertyDimension,
  PropertyHierarchy,
  PropertyLevel,
  QueryOptions,
  Schema,
  Table
} from '@metad/ocap-core'
import flattenDeep from 'lodash/flattenDeep'
import { Cast } from './functions'
import { C_MEASURES_ROW_COUNT, C_MEMBER_CAPTION, serializeIntrinsicName, serializeName, serializeUniqueName } from './types'

export function serializeHierarchyFrom(hierarchy: PropertyHierarchy, dialect: string, catalog: string) {
  if (hierarchy.tables?.length) {
    return serializeTablesJoin(hierarchy.tables, dialect, catalog)
  }

  return serializeName(hierarchy.primaryKeyTable, dialect)
}

export function serializeTablesJoin(tables: Table[], dialect: string, catalog: string) {
  const factTable = tables[0]
  const factTableAlias = serializeName(factTable.name, dialect)
  let statement = serializeName(factTable.name, dialect, catalog) + ` AS ${factTableAlias}`
  const tableNames = [factTable.name]
  let leftTableAlias = factTableAlias
  tables.slice(1).forEach((table, i) => {
    const exists = tableNames.filter((name) => name === table.name)
    const tableAlias = serializeName(exists.length ? `${table.name}(${exists.length})` : table.name, dialect)
    const conditions = table.join.fields
      .map(
        (field) =>
          `${leftTableAlias}.${serializeName(field.leftKey, dialect)} = ${tableAlias}.${serializeName(
            field.rightKey,
            dialect
          )}`
      )
      .join(' AND ')
    statement = `${statement} ${table.join.type} JOIN ${serializeName(
      table.name,
      dialect,
      catalog
    )} AS ${tableAlias} ON ${conditions}`
    leftTableAlias = tableAlias
    tableNames.push(table.name)
  })

  return statement
}

export interface DimensionColumn {
  table?: string
  column?: string
  expression?: string
  alias?: string
}

export type DimensionField = DimensionColumn & {
  columns?: DimensionColumn[]
}

export interface DimensionContext {
  /**
   * Fact table name in Cube
   */
  factTable?: string
  /**
   * 请求中的维度
   */
  dimension?: Dimension
  /**
   * 查询的维度 Schema
   */
  schema?: PropertyDimension
  /**
   * 查询的层级结构 Schema
   */
  hierarchy?: PropertyHierarchy
  dimensionTable?: string
  /**
   * 查询的层级 Schema
   */
  level?: PropertyLevel
  alias?: string
  selectFields: Array<DimensionField>
  parentKeyColumn?: string
  parentColumn?: string
}

export function getLevelColumn(level: PropertyLevel, table: string) {
  return {
    table: level.table || table,
    column: level.nameColumn || level.column
  }
}

export function serializeColumn(field: DimensionField, dialect: string) {
  const needCasts = ['presto', 'trino']
  let statement = ''
  if (field.columns) {
    statement +=
      `concat('[', ` +
      field.columns
        .map(
          (col) =>
            col.expression ??
            (needCasts.includes(dialect)
              ? Cast(`${serializeName(col.table, dialect)}.${serializeName(col.column, dialect)}`, 'VARCHAR')
              : `${serializeName(col.table, dialect)}.${serializeName(col.column, dialect)}`)
        )
        .join(`,'].[',`) +
      `,']')`
  } else {
    statement += `${
      field.expression ?? `${serializeName(field.table, dialect)}.${serializeName(field.column, dialect)}`
    }`
  }
  statement += ` AS ${serializeName(field.alias, dialect)}`

  return statement
}

export function TableColumnMembers(
  dimension: Dimension,
  entityType: EntityType,
  dialect: string,
  catalog: string
) {
  return `SELECT DISTINCT ${serializeName(dimension.dimension, dialect)} AS ${serializeName(
    'memberKey',
    dialect
  )} FROM ${serializeName(entityType.name, dialect, catalog)}`
}

export function DimensionTable(hierarchy: PropertyHierarchy) {
  return hierarchy.primaryKeyTable || hierarchy.tables?.[0]?.name
}

export function LevelMembers(hierarchy: PropertyHierarchy, i: number, dialect: string, catalog: string) {
  const selectFields = []

  if (hierarchy.hasAll && i === 0) {
    selectFields.push({
      expression: `'[(All)]'`,
      alias: `memberKey`
    })
    selectFields.push({
      expression: `'All'`,
      alias: `memberCaption`
    })
  } else {
    const levels = hierarchy.levels.slice(hierarchy.hasAll ? 1 : 0, i + 1)
    const dimensionTable = DimensionTable(hierarchy)
    selectFields.push({
      // table: dimensionTable,
      columns: levels.map((level) => {
        const table = level.table || dimensionTable
        return getLevelColumn(level, table)
      }),
      alias: `memberKey`
    })

    selectFields.push(
      ...LevelCaptionFields(dimensionTable, levels[levels.length - 1], dialect).map((field) => ({
        ...field,
        alias: 'memberCaption'
      }))
    )

    if (levels.length > 1) {
      selectFields.push({
        // table: dimensionTable,
        columns: levels.slice(0, levels.length - 1).map((level) => {
          const table = level.table || dimensionTable
          return getLevelColumn(level, table)
        }),
        alias: `parentKey`
      })
    } else if (hierarchy.hasAll) {
      selectFields.push({
        expression: `'[(All)]'`,
        alias: `parentKey`
      })
    }
  }

  let statement = `SELECT ${selectFields
    .map((item) => serializeColumn(item, dialect))
    .join(', ')} FROM ${serializeHierarchyFrom(hierarchy, dialect, catalog)}`

  statement += ` GROUP BY ` + (serializeGroupByDimensions([{ hierarchy, selectFields }], dialect) || 1)

  return statement
}

export function DimensionMembers(
  entity: string,
  dimension: Dimension,
  entityType: EntityType,
  schema: Schema,
  dialect: string,
  catalog?: string
) {
  if (
    !schema?.cubes?.find((item) => item.name === entity) &&
    !schema?.dimensions?.find((item) => item.name === entity)
  ) {
    return [TableColumnMembers(dimension, entityType, dialect, catalog)]
  }

  const hierarchy = getEntityHierarchy(entityType, dimension)
  if (!hierarchy) {
    throw new Error(`未找到维度'${dimension.dimension}'或层级结构'${dimension.hierarchy}'`)
  }
  const levels = hierarchy.levels // .slice(hierarchy.hasAll ? 1 : 0)
  return levels.map((level, i) => {
    return LevelMembers(hierarchy, i, dialect, catalog)
  })
}

export function LevelCaptionFields(table: string, level: PropertyLevel, dialect: string) {
  const selectFields = []
  const captionColumn = level.captionColumn || level.nameColumn || level.column

  if (level.captionExpression?.sql?.content) {
    // Caption Expression
    selectFields.push({
      table,
      column: captionColumn,
      expression: level.captionExpression.sql.content, // 需要判断 dialect
      alias: serializeIntrinsicName(dialect, level.name, 'MEMBER_CAPTION') // 先与 MDX 命名保持一致
    })
  } else if (captionColumn) {
    // CaptionColumn
    selectFields.push({
      table,
      column: captionColumn,
      alias: serializeIntrinsicName(dialect, level.name, 'MEMBER_CAPTION') // 先与 MDX 命名保持一致
    })
  }

  return selectFields
}

export function buildDimensionContext(
  context: DimensionContext,
  entityType: EntityType,
  row: Dimension,
  dialect: string
): DimensionContext {
  const property = getEntityProperty(entityType, row)
  if (!property) {
    throw new Error(`未找到维度'${row.dimension}'`)
  }

  context.schema = property
  context.dimension = row

  const _hierarchy = property.hierarchies?.find((item) =>
    row.hierarchy ? item.name === (row.hierarchy ?? '') : item.name === row.dimension
  )
  if (context.hierarchy && context.hierarchy.name !== _hierarchy.name) {
    throw new Error(`不能同时查询不同层级结构`)
  }
  context.hierarchy = _hierarchy

  const lIndex = row.level ? context.hierarchy.levels?.findIndex((item) => item.name === row.level) : 0

  if (lIndex > -1) {
    const level = context.hierarchy.levels[lIndex]
    context.dimensionTable = context.hierarchy.primaryKeyTable || context.hierarchy.tables[0].name
    const table = level.table || context.dimensionTable || context.factTable
    const nameColumn = level.nameColumn || level.column
    // let captionColumn = level.captionColumn || level.nameColumn
    // if (level.uniqueMembers) {
    //   context.selectFields.push({
    //     table,
    //     column: nameColumn,
    //     alias: level.name
    //   })
    // } else {
    //
    // captionColumn = captionColumn || nameColumn
    context.selectFields.push({
      table,
      columns: context.hierarchy.levels.slice(context.hierarchy.hasAll ? 1 : 0, lIndex + 1).map((level) => {
        return getLevelColumn(level, table)
      }),
      alias: level.name
    })
    // }

    context.selectFields.push(...LevelCaptionFields(table, level, dialect))

    if (level.parentColumn) {
      context.parentKeyColumn = level.column
      context.parentColumn = level.parentColumn
      context.selectFields.push({
        table: table + '(1)',
        column: nameColumn,
        alias: serializeIntrinsicName(dialect, level.name, 'PARENT_UNIQUE_NAME') // 先与 MDX 命名保持一致
      })
    }

    row.properties?.forEach((name) => {
      const property = level.properties?.find((item) => item.name === name)
      if (property) {
        context.selectFields.push({
          table,
          column: property.column,
          alias: property.name
        })
      }
    })
  } else {
    throw new Error(`找不到 Level ${row.level}`)
  }

  return context
}

export function createDimensionContext(entityType: EntityType, dimension: Dimension) {
  const hierarchy = getEntityHierarchy(entityType, dimension)
  const dimensionTable = DimensionTable(hierarchy)
  return {
    dimension: { dimension: dimension.dimension, hierarchy: dimension.hierarchy || dimension.dimension },
    schema: getEntityProperty(entityType, dimension),
    hierarchy,
    dimensionTable,
    selectFields: []
  } as DimensionContext
}

export function queryDimension(
  dimension: PropertyDimension,
  entityType: EntityType,
  options: QueryOptions,
  dialect?: string,
  catalog?: string
) {
  let context = { selectFields: [] } as DimensionContext
  // const selectFields = []
  const measures = []

  // let hierarchy: PropertyHierarchy
  // let parentKeyColumn
  // let parentColumn
  ;[...(options.rows ?? []), ...(options.columns ?? [])].forEach((row) => {
    if (isMeasure(row)) {
      if (row.measure === C_MEASURES_ROW_COUNT) {
        measures.push({
          column: 1,
          aggregator: 'SUM',
          alias: C_MEASURES_ROW_COUNT
        })
      }
    } else {
      context = buildDimensionContext(context, entityType, row, dialect)
    }
  })

  let statement = context.selectFields.map((field) => serializeColumn(field, dialect)).join(', ')

  if (measures.length) {
    statement +=
      ', ' +
      measures
        .map(
          (measure) =>
            `${measure.aggregator}(${
              typeof measure.column === 'number'
                ? measure.column
                : serializeName(measure.table, dialect) + '.' + serializeName(measure.column, dialect)
            }) AS ${serializeName(measure.alias, dialect)}`
        )
        .join(', ')
  }

  statement +=
    ` FROM ` +
    (context.parentColumn
      ? serializeTablesJoin(
          [
            context.hierarchy.tables[0],
            {
              name: context.hierarchy.tables[0].name,
              join: {
                type: 'Left',
                fields: [
                  {
                    leftKey: context.parentColumn,
                    rightKey: context.parentKeyColumn
                  }
                ]
              }
            }
          ],
          dialect,
          catalog
        )
      : serializeHierarchyFrom(context.hierarchy, dialect, catalog))

  if (measures.length) {
    statement += ` GROUP BY ` + serializeGroupByDimensions([context], dialect)
  }

  statement = `SELECT ` + statement

  return statement
}

export function serializeGroupByDimensions(dimensions: DimensionContext[], dialect: string) {
  return [
    ...new Set(
      flattenDeep<DimensionColumn>(
        dimensions.map((dimension) => dimension.selectFields.map((field) => (field.columns ? field.columns : [field])))
      )
        .filter((field) => !!field.column)
        .map((field) => `${serializeName(field.table, dialect)}.${serializeName(field.column, dialect)}`)
    )
  ].join(', ')
}

/**
 * Compile Dimension in Schema to Runtime EntityType property dimension
 *
 * @param entity Entity Name
 * @param dimension Dimension in Schema
 * @returns dimension property in EntityType
 */
export function compileDimensionSchema(
  entity: string,
  dimension: PropertyDimension,
  dialect?: string
): PropertyDimension {
  const dimensionUniqueName = serializeUniqueName(dialect, dimension.name)
  return {
    ...dimension,
    entity,
    name: dimensionUniqueName,
    hierarchies: dimension.hierarchies?.map((hierarchy) => {
      const hierarchyUniqueName = serializeUniqueName(dialect, dimension.name, hierarchy.name)
      const levels = hierarchy.levels?.map((level) => ({
        ...level,
        name: serializeUniqueName(dialect, dimension.name, hierarchy.name, level.name),
        caption: serializeUniqueName(dialect, dimension.name, hierarchy.name, level.name, C_MEMBER_CAPTION),
        role: AggregationRole.level,
        properties: level.properties?.map((property) => ({
          ...property,
          name: serializeUniqueName(dialect, dimension.name, hierarchy.name, property.name),
          label: property.name
        }))
      }))

      if (hierarchy.hasAll) {
        levels?.splice(0, 0, {
          name: serializeUniqueName(
            dialect,
            dimension.name,
            hierarchy.name,
            hierarchy.allMemberName || `(All ${hierarchy.name || dimension.name}s)`
          ),
          role: AggregationRole.level,
          caption: serializeUniqueName(
            dialect,
            dimension.name,
            hierarchy.name,
            hierarchy.allMemberName || `(All ${hierarchy.name || dimension.name}s)`,
            C_MEMBER_CAPTION
          ),
          properties: []
        })
      }

      return {
        ...hierarchy,
        name: hierarchyUniqueName,
        entity,
        dimension: dimensionUniqueName,
        role: AggregationRole.hierarchy,
        caption: serializeUniqueName(dialect, dimension.name, hierarchy.name, C_MEMBER_CAPTION),
        levels: levels?.map((level, i) => ({
          ...level,
          levelNumber: i,
          entity,
          dimension: dimensionUniqueName,
          hierarchy: hierarchyUniqueName
        }))
      }
    }),
    role: AggregationRole.dimension
  }
}
