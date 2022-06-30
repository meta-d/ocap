import {
  AggregationRole,
  Dimension,
  EntityType,
  getEntityProperty,
  isMeasure,
  PropertyDimension,
  PropertyHierarchy,
  PropertyLevel,
  QueryOptions,
  Schema,
  serializeUniqueName,
  Table
} from '@metad/ocap-core'
import { flattenDeep } from 'lodash'
import { From } from './query'
import { C_MEASURES_ROW_COUNT, C_MEMBER_CAPTION, serializeName } from './types'

export function DimensionMembers(dimension: Dimension, entityType: EntityType, schema: Schema, dialect: string) {
  return `SELECT DISTINCT ${serializeName(dimension.dimension, dialect)} FROM ${From(entityType, schema, dialect)}`
}

export function serializeHierarchyFrom(hierarchy: PropertyHierarchy, dialect: string) {
  if (hierarchy.tables?.length) {
    return serializeTablesJoin(hierarchy.tables, dialect)
  }

  return serializeName(hierarchy.primaryKeyTable, dialect)
}

export function serializeTablesJoin(tables: Table[], dialect: string) {
  const factTable = tables[0]
  const factTableAlias = serializeName(factTable.name, dialect)
  let statement = serializeName(factTable.name, dialect) + ` AS ${factTableAlias}`
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
      dialect
    )} AS ${tableAlias} ON ${conditions}`
    leftTableAlias = tableAlias
    tableNames.push(table.name)
  })

  return statement
}

export interface DimensionColumn {
  table: string
  column?: string
  expression?: string
  alias?: string
}

export type DimensionField = DimensionColumn & {
  columns?: DimensionColumn[]
}

export interface DimensionContext {
  schema: PropertyDimension
  dimension: Dimension
  hierarchy: PropertyHierarchy
  alias: string
  selectFields: Array<DimensionField>
  parentKeyColumn: string
  parentColumn: string
}

export function getLevelColumn(level: PropertyLevel, table: string) {
  return {
    table: level.table || table,
    column: level.nameColumn || level.column,
  }
}

export function buildDimensionContext(
  context: DimensionContext,
  entityType: EntityType,
  row: Dimension
): DimensionContext {
  const property = getEntityProperty(entityType, row)
  if (!property) {
    throw new Error(`未找到维度'${row.dimension}'`)
  }

  context.schema = property
  context.dimension = row
  // context.selectFields = []

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
    const levelTable = context.hierarchy.primaryKeyTable || context.hierarchy.tables[0].name
    const table = level.table || levelTable
    const nameColumn = level.nameColumn || level.column
    let captionColumn = level.captionColumn || level.nameColumn
    if (level.uniqueMembers) {
      context.selectFields.push({
        table,
        column: nameColumn,
        alias: level.name
      })
    } else {
      // 
      captionColumn = captionColumn || nameColumn
      context.selectFields.push({
        table,
        columns: context.hierarchy.levels.slice(0, lIndex + 1).map((level) => {
          return getLevelColumn(level, levelTable)
        }),
        alias: level.name
      })
    }
    
    if (level.captionExpression?.sql?.content) {
      // Caption Expression
      context.selectFields.push({
        table: level.table,
        column: captionColumn,
        expression: level.captionExpression.sql.content, // 需要判断 dialect
        alias: level.name + '.[MEMBER_CAPTION]' // 先与 MDX 命名保持一致
      })
    } else if (captionColumn) {
      // CaptionColumn
      context.selectFields.push({
        table,
        column: captionColumn,
        alias: level.name + '.[MEMBER_CAPTION]' // 先与 MDX 命名保持一致
      })
    }

    if (level.parentColumn) {
      context.parentKeyColumn = level.column
      context.parentColumn = level.parentColumn
      context.selectFields.push({
        table: table + '(1)',
        column: nameColumn,
        alias: level.name + '.[PARENT_UNIQUE_NAME]' // 先与 MDX 命名保持一致
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

export function serializeColumn(field: DimensionField, dialect: string) {
  let statement = ''
  if (field.columns) {
    statement += `concat('[', ` + field.columns.map((col) => col.expression ?? `${serializeName(col.table, dialect)}.${serializeName(col.column, dialect)}`)
      .join(`,'].[',`) + `,']')`
  } else {
    statement += `${
      field.expression ?? `${serializeName(field.table, dialect)}.${serializeName(field.column, dialect)}`
    }`
  }
  statement += ` AS ${serializeName(field.alias, dialect)}`

  return statement
}

export function queryDimension(
  dimension: PropertyDimension,
  entityType: EntityType,
  options: QueryOptions,
  dialect?: string
) {
  let context = {selectFields: []} as DimensionContext
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
      context = buildDimensionContext(context, entityType, row)

      // const property = getEntityProperty(entityType, row)
      // if (!property) {
      //   throw new Error(`未找到维度'${row.dimension}'`)
      // }
      // const _hierarchy = property.hierarchies?.find((item) =>
      //   row.hierarchy ? item.name === (row.hierarchy ?? '') : item.name === row.dimension
      // )
      // if (hierarchy && hierarchy.name !== _hierarchy.name) {
      //   throw new Error(`不能同时查询不同层级结构`)
      // }
      // hierarchy = _hierarchy
      // if (row.level) {
      //   const level = hierarchy.levels?.find((item) => item.name === row.level)
      //   if (level) {
      //     const table = level.table || hierarchy.primaryKeyTable || hierarchy.tables[0].name
      //     const nameColumn = level.nameColumn || level.column
      //     selectFields.push({
      //       table,
      //       column: nameColumn,
      //       alias: row.level
      //     })

      //     const captionColumn = level.captionColumn || level.nameColumn
      //     if (level.captionExpression?.sql?.content) {
      //       // Caption Expression
      //       selectFields.push({
      //         table: level.table,
      //         column: captionColumn,
      //         expression: level.captionExpression.sql.content, // 需要判断 dialect
      //         alias: row.level + '.[MEMBER_CAPTION]' // 先与 MDX 命名保持一致
      //       })
      //     } else if (captionColumn) {
      //       // CaptionColumn
      //       selectFields.push({
      //         table,
      //         column: captionColumn,
      //         alias: row.level + '.[MEMBER_CAPTION]' // 先与 MDX 命名保持一致
      //       })
      //     }

      //     if (level.parentColumn) {
      //       parentKeyColumn = level.column
      //       parentColumn = level.parentColumn
      //       selectFields.push({
      //         table: table + '(1)',
      //         column: nameColumn,
      //         alias: row.level + '.[PARENT_UNIQUE_NAME]' // 先与 MDX 命名保持一致
      //       })
      //     }

      //     row.properties?.forEach((name) => {
      //       const property = level.properties?.find((item) => item.name === name)
      //       if (property) {
      //         selectFields.push({
      //           table,
      //           column: property.column,
      //           alias: property.name
      //         })
      //       }
      //     })
      //   } else {
      //     throw new Error(`找不到 Level ${row.level}`)
      //   }
      // }
    }
  })

  let statement = context.selectFields
    .map(
      (field) => serializeColumn(field, dialect))
    .join(', ')

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
          dialect
        )
      : serializeHierarchyFrom(context.hierarchy, dialect))

  if (measures.length) {
    statement +=
      ` GROUP BY ` + serializeGroupByDimensions([context], dialect)
  }

  statement = `SELECT ` + statement

  return statement
}

export function serializeGroupByDimensions(dimensions: DimensionContext[], dialect: string) {
  return [
    ...new Set(
      flattenDeep<DimensionColumn>(dimensions.map((dimension) => dimension.selectFields.map((field) => field.columns ? field.columns : [field])))
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
export function compileDimensionSchema(entity: string, dimension: PropertyDimension): PropertyDimension {
  return {
    ...dimension,
    entity,
    name: serializeUniqueName(dimension.name),
    hierarchies: dimension.hierarchies?.map((hierarchy) => ({
      ...hierarchy,
      name: serializeUniqueName(dimension.name, hierarchy.name),
      entity,
      role: AggregationRole.hierarchy,
      levels: hierarchy.levels?.map((level) => ({
        ...level,
        name: serializeUniqueName(dimension.name, hierarchy.name, level.name),
        entity,
        caption:
          level.captionColumn || level.nameColumn
            ? serializeUniqueName(dimension.name, hierarchy.name, level.name, C_MEMBER_CAPTION)
            : null,
        role: AggregationRole.level,
        properties: level.properties?.map((property) => ({
          ...property,
          name: serializeUniqueName(dimension.name, hierarchy.name, property.name),
          label: property.name
        }))
      }))
    })),
    role: AggregationRole.dimension
  }
}
