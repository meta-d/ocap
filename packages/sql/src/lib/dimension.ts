import {
  AggregationRole,
  Dimension,
  EntityType,
  getEntityHierarchy,
  getEntityProperty,
  IMember,
  IntrinsicMemberProperties,
  isMeasure,
  PropertyDimension,
  PropertyHierarchy,
  PropertyLevel,
  QueryOptions,
  Schema,
  Table
} from '@metad/ocap-core'
import flattenDeep from 'lodash/flattenDeep'
import countBy from 'lodash/countBy'
import { CubeFactTable, LevelsToColumns } from './cube'
import { Cast } from './functions'
import { AggregateFunctions, C_MEASURES_ROW_COUNT } from './types'
import { serializeIntrinsicName, serializeName, serializeTableAlias, serializeUniqueName } from './utils'


export interface DimensionColumn {
  table?: string
  column?: string
  expression?: string
  alias?: string
  cast?: 'VARCHAR'
  aggregate?: AggregateFunctions
}

export type DimensionField = DimensionColumn & {
  columns?: DimensionColumn[]
}

export interface LevelContext {
  /**
   * 查询的层级 Schema
   */
  level?: PropertyLevel
  selectFields: Array<DimensionField>
}

export interface DimensionContext {
  dialect: string
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
   * 这个是谁的别名 ?
   */
  alias?: string
  selectFields: Array<DimensionField>
  // parentKeyColumn?: string
  parentColumn?: string
  role: 'row' | 'column'
  levels: Array<LevelContext>
  // 最终输出结果的字段们
  columns?: string[]
  keyColumn?: string
  captionColumn?: string
  parentKeyColumn?: string
  childrenCardinalityColumn?: string
  members?: IMember[]
}

export function serializeHierarchyFrom(
  factTable: string,
  hierarchy: PropertyHierarchy,
  dialect: string,
  catalog: string
) {
  if (hierarchy.tables?.length) {
    return serializeTablesJoin(hierarchy.name, hierarchy.tables, dialect, catalog)
  }

  return serializeName(
    hierarchy.primaryKeyTable ? serializeTableAlias(hierarchy.name, hierarchy.primaryKeyTable) : factTable,
    dialect
  )
}

export function serializeTablesJoin(prefix: string, tables: Table[], dialect: string, catalog: string) {
  const factTable = tables[0]
  const factTableAlias = serializeName(serializeTableAlias(prefix, factTable.name), dialect)
  let statement = serializeName(factTable.name, dialect, catalog) + ` AS ${factTableAlias}`
  const tableNames = [factTable.name]
  let leftTableAlias = factTableAlias
  tables.slice(1).forEach((table, i) => {
    const exists = tableNames.filter((name) => name === table.name)
    const tableAlias = serializeName(
      serializeTableAlias(prefix, exists.length ? `${table.name}(${exists.length})` : table.name),
      dialect
    )
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

  if (tables.length > 1) {
    statement = `(${statement})`
  }

  return statement
}


export function getLevelColumn(level: PropertyLevel, table: string) {
  return {
    table,
    column: level.nameColumn || level.column
  }
}

export function unassignedMember(column: DimensionColumn, dialect: string) {
  return `CASE WHEN ${serializeName(column.table, dialect)}.${serializeName(
    column.column,
    dialect
  )} IS NULL THEN '#' ELSE ${Cast(
    `${serializeName(column.table, dialect)}.${serializeName(column.column, dialect)}`,
    'VARCHAR'
  )} END`
}

export function serializeColumn(field: DimensionField, dialect: string) {
  const needCasts = ['presto', 'trino']
  let statement = ''
  if (field.columns) {
    statement = field.columns.length ? 
      `concat('[', ` +
      field.columns
        .map(
          (col) => col.expression ?? unassignedMember(col, dialect)
          // (needCasts.includes(dialect)
          //   ? Cast(`${serializeName(col.table, dialect)}.${serializeName(col.column, dialect)}`, 'VARCHAR')
          //   : `${serializeName(col.table, dialect)}.${serializeName(col.column, dialect)}`)
        )
        .join(`,'].[',`) +
      `,']')` : `''`
  } else {
    statement = `${
      field.expression ?? `${serializeName(field.table, dialect)}.${serializeName(field.column, dialect)}`
    }`
    if (field.cast) {
      statement = `CAST(${statement} AS ${field.cast})`
    }
  }

  if (field.aggregate) {
    switch(field.aggregate) {
      case AggregateFunctions.COUNT_DISTINCT:
        statement = `COUNT(DISTINCT ${statement})`
        break
      default:
    }
  }

  statement += ` AS ${serializeName(field.alias, dialect)}`

  return statement
}

export function TableColumnMembers(dimension: Dimension, entityType: EntityType, dialect: string, catalog: string) {
  return `SELECT DISTINCT ${serializeName(dimension.dimension, dialect)} AS ${serializeName(
    'memberKey',
    dialect
  )} FROM ${serializeName(entityType.name, dialect, catalog)}`
}

export function DimensionTable(hierarchy: PropertyHierarchy) {
  return hierarchy.primaryKeyTable || hierarchy.tables?.[0]?.name
}

export function LevelMembers(
  factTable: string,
  hierarchy: PropertyHierarchy,
  i: number,
  dialect: string,
  catalog: string
) {
  const selectFields = []

  if (hierarchy.hasAll && i === 0) {
    selectFields.push({
      expression: hierarchy.allMemberName ? `'[${hierarchy.allMemberName}]'` : `'[(All)]'`,
      alias: `memberKey`
    })
    selectFields.push({
      expression: hierarchy.allMemberName ? `'${hierarchy.allMemberName}'` :`'All'`,
      alias: `memberCaption`
    })
  } else {
    const levels = hierarchy.levels.slice(hierarchy.hasAll ? 1 : 0, i + 1)
    const dimensionTable = DimensionTable(hierarchy)
    selectFields.push({
      columns: levels.map((level) => {
        const table = level.table || dimensionTable
        return getLevelColumn(level, table ? serializeTableAlias(hierarchy.name, table) : factTable)
      }),
      alias: `memberKey`
    })

    const level = levels[levels.length - 1]
    const table = level.table || dimensionTable
    selectFields.push(
      ...LevelCaptionFields(table ? serializeTableAlias(hierarchy.name, table) : factTable, level, dialect).map((field) => ({
        ...field,
        alias: 'memberCaption'
      }))
    )

    if (levels.length > 1) {
      selectFields.push({
        columns: levels.slice(0, levels.length - 1).map((level) => {
          const table = level.table || dimensionTable
          return getLevelColumn(level, table ? serializeTableAlias(hierarchy.name, table) : factTable)
        }),
        alias: `parentKey`
      })
    } else if (hierarchy.hasAll) {
      selectFields.push({
        expression: hierarchy.allMemberName ? `'[${hierarchy.allMemberName}]'` : `'[(All)]'`,
        alias: `parentKey`
      })
    }
  }

  let statement = `SELECT ${selectFields
    .map((item) => serializeColumn(item, dialect))
    .join(', ')} FROM ${serializeHierarchyFrom(factTable, hierarchy, dialect, catalog)}`

  statement += ` GROUP BY ` + (serializeGroupByDimensions([{ dialect, hierarchy, selectFields, role: 'row', levels: [] }], dialect) || 1)

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
  const cube = schema.cubes?.find((item) => item.name === entity)
  const factTable = cube ? CubeFactTable(cube) : null
  const levels = hierarchy.levels // .slice(hierarchy.hasAll ? 1 : 0)
  return levels.map((level, i) => {
    return LevelMembers(factTable, hierarchy, i, dialect, catalog)
  })
}

export function LevelCaptionFields(table: string, level: PropertyLevel, dialect: string) {
  const selectFields: DimensionField[] = []
  const captionColumn = level.captionColumn || level.nameColumn || level.column

  if (level.captionExpression?.sql?.content) {
    // Caption Expression
    selectFields.push({
      table,
      column: captionColumn,
      expression: level.captionExpression.sql.content, // 需要判断 dialect
      alias: serializeIntrinsicName(dialect, level.name, IntrinsicMemberProperties.MEMBER_CAPTION) // 先与 MDX 命名保持一致
    })
  } else if (captionColumn) {
    // CaptionColumn
    selectFields.push({
      table,
      column: captionColumn,
      alias: serializeIntrinsicName(dialect, level.name, IntrinsicMemberProperties.MEMBER_CAPTION), // 先与 MDX 命名保持一致
      cast: 'VARCHAR'
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
    const table = serializeTableAlias(context.hierarchy.name, level.table || context.dimensionTable) || context.factTable
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
    const levels = context.hierarchy.levels.slice(context.hierarchy.hasAll ? 1 : 0, lIndex + 1)
    const memberUniqueNameColumns = levels.map((level) => {
      const levelTable = level.table || context.dimensionTable
      return getLevelColumn(level, levelTable ? serializeTableAlias(context.hierarchy.name, levelTable) : context.factTable)
    })
    context.selectFields.push({
      table,
      columns: memberUniqueNameColumns,
      alias: level.name
    })
    // }

    context.selectFields.push(...LevelCaptionFields(table, level, dialect))

    // 这里是自循环的 ParentChild
    if (level.parentColumn) {
      context.parentKeyColumn = level.column
      context.parentColumn = level.parentColumn
      const parentTable = table + '(1)'
      context.selectFields.push({
        table: parentTable,
        columns: memberUniqueNameColumns.map((column) => ({...column, table: parentTable})),
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
          context.hierarchy.name,
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
      : serializeHierarchyFrom('', context.hierarchy, dialect, catalog))

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
        dimensions.map((context) => context.selectFields?.filter((field) => !field.aggregate).map((field) => (field.columns ? field.columns : [field])))
      )
        .filter((field) => !!field?.column )
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

  // Validators
  Object.entries(countBy(dimension.hierarchies?.map((hierarchy) => ({name: hierarchy.name || ''})), 'name'))
    .forEach(([name, count]) => {
      if (count > 1) {
        throw new Error(`Hierarchy name '${name}' cannot be duplicated.`)
      }
    })

  const dimensionUniqueName = serializeUniqueName(dialect, dimension.name)

  const hierarchies = dimension.hierarchies?.map((hierarchy) => {
    // Validator: If has dimension table then must set primaryKey
    if (hierarchy.tables?.length && !hierarchy.primaryKey) {
      throw new Error(`The primaryKey '${hierarchy.primaryKey}' of hierarchy '${hierarchy.name ?? ''}' is not correct!`)
    }
    // Validator: If has multiple dimension tables
    if (hierarchy.tables?.length > 1) {
      // Tables joins check
      tablesValidator(hierarchy.tables)
      // must set primaryKeyTable
      if (!hierarchy.primaryKeyTable) {
        throw new Error(`The primaryKeyTable of hierarchy '${hierarchy.name ?? ''}' is need!`)
      }
    }

    const hierarchyUniqueName = serializeUniqueName(dialect, dimension.name, hierarchy.name)
    const levels = hierarchy.levels?.map((level) => ({
      ...level,
      label: level.label ?? level.name,
      name: serializeUniqueName(dialect, dimension.name, hierarchy.name, level.name),
      caption: serializeUniqueName(dialect, dimension.name, hierarchy.name, level.name, IntrinsicMemberProperties.MEMBER_CAPTION),
      role: AggregationRole.level,
      properties: level.properties?.map((property) => ({
        ...property,
        name: serializeUniqueName(dialect, dimension.name, hierarchy.name, property.name),
        label: property.name
      }))
    }))

    if (hierarchy.hasAll) {
      const allLevelName = hierarchy.allLevelName || `(All ${hierarchy.name || dimension.name}s)`
      const allLevelUniqueName = serializeUniqueName(
        dialect,
        dimension.name,
        hierarchy.name,
        allLevelName
      )
      levels?.splice(0, 0, {
        name: allLevelUniqueName,
        label: allLevelName,
        role: AggregationRole.level,
        caption: serializeIntrinsicName(
          dialect,
          allLevelUniqueName,
          IntrinsicMemberProperties.MEMBER_CAPTION
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
      caption: serializeUniqueName(dialect, dimension.name, hierarchy.name, IntrinsicMemberProperties.MEMBER_CAPTION),
      levels: levels?.map((level, i) => ({
        ...level,
        levelNumber: i,
        entity,
        dimension: dimensionUniqueName,
        hierarchy: hierarchyUniqueName
      }))
    }
  })

  return {
    ...dimension,
    entity,
    name: dimensionUniqueName,
    caption: serializeIntrinsicName(dialect, dimensionUniqueName, IntrinsicMemberProperties.MEMBER_CAPTION),
    hierarchies,
    role: AggregationRole.dimension
  }
}

export function tablesValidator(tables: Table[]) {
  if (tables.slice(1).some((table) => !table.join?.fields?.length)) {
    throw new Error(`tables join fields is need!`)
  }
}
