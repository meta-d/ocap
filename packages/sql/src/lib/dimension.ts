import {
  AggregationRole,
  Dimension,
  EntityType,
  getEntityProperty,
  isMeasure,
  PropertyDimension,
  PropertyHierarchy,
  QueryOptions,
  Schema,
  serializeUniqueName,
  Table
} from '@metad/ocap-core'
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

export function queryDimension(
  dimension: PropertyDimension,
  entityType: EntityType,
  options: QueryOptions,
  dialect?: string
) {
  const selectFields = []
  const measures = []

  let hierarchy: PropertyHierarchy
  let parentKeyColumn
  let parentColumn
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
      const property = getEntityProperty(entityType, row)
      if (!property) {
        throw new Error(`未找到维度'${row.dimension}'`)
      }
      const _hierarchy = property.hierarchies?.find((item) =>
        row.hierarchy ? item.name === (row.hierarchy ?? '') : item.name === row.dimension
      )
      if (hierarchy && hierarchy.name !== _hierarchy.name) {
        throw new Error(`不能同时查询不同层级结构`)
      }
      hierarchy = _hierarchy
      if (row.level) {
        const level = hierarchy.levels?.find((item) => item.name === row.level)
        if (level) {
          const table = level.table || hierarchy.primaryKeyTable || hierarchy.tables[0].name
          const nameColumn = level.nameColumn || level.column
          selectFields.push({
            table,
            column: nameColumn,
            alias: row.level
          })

          const captionColumn = level.captionColumn || level.nameColumn
          if (level.captionExpression?.sql?.content) {
            // Caption Expression
            selectFields.push({
              table: level.table,
              column: captionColumn,
              expression: level.captionExpression.sql.content, // 需要判断 dialect
              alias: row.level + '.[MEMBER_CAPTION]' // 先与 MDX 命名保持一致
            })
          } else if (captionColumn) {
            // CaptionColumn
            selectFields.push({
              table,
              column: captionColumn,
              alias: row.level + '.[MEMBER_CAPTION]' // 先与 MDX 命名保持一致
            })
          }

          if (level.parentColumn) {
            parentKeyColumn = level.column
            parentColumn = level.parentColumn
            selectFields.push({
              table: table + '(1)',
              column: nameColumn,
              alias: row.level + '.[PARENT_UNIQUE_NAME]' // 先与 MDX 命名保持一致
            })
          }

          row.properties?.forEach((name) => {
            const property = level.properties?.find((item) => item.name === name)
            if (property) {
              selectFields.push({
                table,
                column: property.column,
                alias: property.name
              })
            }
          })
        } else {
          throw new Error(`找不到 Level ${row.level}`)
        }
      }
    }
  })

  let statement = selectFields
    .map(
      (field) =>
        `${
          field.expression ?? `${serializeName(field.table, dialect)}.${serializeName(field.column, dialect)}`
        } AS ${serializeName(field.alias, dialect)}`
    )
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

  statement += ` FROM ` + (parentColumn ? serializeTablesJoin([
    hierarchy.tables[0],
    {
      name: hierarchy.tables[0].name,
      join: {
        type: 'Left',
        fields: [
          {
            leftKey: parentColumn,
            rightKey: parentKeyColumn
          }
        ]
      }
    },
  ], dialect) : serializeHierarchyFrom(hierarchy, dialect))

  if (measures.length) {
    statement +=
      ` GROUP BY ` +
      [
        ...new Set(
          selectFields
            .filter((field) => !!field.column)
            .map((field) => `${serializeName(field.table, dialect)}.${serializeName(field.column, dialect)}`)
        )
      ].join(', ')
  }

  statement = `SELECT ` + statement

  console.log(statement)
  
  return statement
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
      levels: hierarchy.levels?.map((level) => ({
        ...level,
        name: serializeUniqueName(dimension.name, hierarchy.name, level.name),
        entity,
        caption:
          level.captionColumn || level.nameColumn
            ? serializeUniqueName(dimension.name, hierarchy.name, level.name, C_MEMBER_CAPTION)
            : null,
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
