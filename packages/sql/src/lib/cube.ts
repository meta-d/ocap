import {
  AggregationRole,
  CalculationType,
  Cube,
  C_MEASURES,
  Dimension,
  EntityType,
  getEntityDefaultMeasure,
  getEntityProperty,
  IntrinsicMemberProperties,
  isMeasure,
  PropertyDimension,
  PropertyLevel,
  PropertyMeasure,
  QueryOptions
} from '@metad/ocap-core'
import { compileDimensionSchema, DimensionContext, getLevelColumn, LevelContext } from './dimension'
import { AggregateFunctions } from './types'
import { serializeIntrinsicName, serializeMeasureName, serializeTableAlias } from './utils'

/**
 * Compile the cube of entity with it's dimensions to runtime entity type
 *
 * @param entity
 * @param cube
 * @param dimensions
 * @param dialect
 * @returns
 */
export function compileCubeSchema(
  entity: string,
  cube: Cube,
  dimensions: PropertyDimension[],
  dialect: string
): EntityType {
  const properties = {}

  cube.dimensionUsages?.forEach((usage) => {
    const dimension = dimensions?.find((item) => item.name === usage.source)
    if (dimension) {
      const property = compileDimensionSchema(
        entity,
        {
          ...dimension,
          name: usage.name,
          foreignKey: usage.foreignKey || dimension.foreignKey
        },
        dialect
      )
      properties[property.name] = property
    } else {
      throw new Error(`Can't found dimension for source '${usage.source}'`)
    }
  })

  cube.dimensions?.forEach((dimension) => {
    const property = compileDimensionSchema(entity, dimension, dialect)
    properties[property.name] = property
  })

  cube.measures?.forEach((measure) => {
    const name = serializeMeasureName(dialect, measure.name)
    properties[name] = {
      ...measure,
      name,
      role: AggregationRole.measure
    }
  })

  cube.calculatedMembers
    ?.filter((member) => member.visible)
    .forEach((calculatedMember) => {
      if (calculatedMember.dimension === C_MEASURES) {
        const name = serializeMeasureName(dialect, calculatedMember.name)
        properties[name] = {
          ...calculatedMember,
          name,
          role: AggregationRole.measure,
          dataType: 'number',
          calculationType: CalculationType.Calculated
        }
      }
    })

  return {
    name: entity,
    label: cube.label,
    defaultMeasure: cube.defaultMeasure,
    properties
  }
}

export interface CubeContext {
  schema: Cube
  entityType: EntityType
  factTable: string
  dimensions: DimensionContext[]
  measures: Array<{ alias: string } & PropertyMeasure>
  filterString?: string
}

export function CubeFactTable(cube: Cube) {
  if (!cube.tables?.[0]?.name) {
    throw new Error(`未找到多维数据集 '${cube.name}' 的事实表`)
  }
  // 暂时只支持一个事实表
  return serializeTableAlias(cube.name, cube.tables[0].name)
}

export function buildCubeContext(
  cube: Cube,
  options: QueryOptions,
  entityType: EntityType,
  dialect: string
): CubeContext {
  const factTable = CubeFactTable(cube)
  if (!factTable) {
    throw new Error(`在模型中未找到事实表`)
  }

  const context = { schema: cube, entityType, dimensions: [], measures: [], factTable } as CubeContext

  ;[
    ...(options.rows?.map((row) => ({ row, role: 'row' })) ?? []),
    ...(options.columns?.map((row) => ({ row, role: 'column' })) ?? [])
  ].forEach(({ row, role }) => {
    let dimension = context.dimensions.find((item) => item.dimension.dimension === row.dimension)
    if (!dimension) {
      dimension = { dialect, factTable, dimension: row, levels: [], role } as DimensionContext
      context.dimensions.push(dimension)
    }
    if (isMeasure(row)) {
      const measure = getEntityProperty(entityType, row)
      if (!measure) {
        throw new Error(`未找到度量'${row.measure}'`)
      }
      context.measures.push({
        ...measure,
        alias: measure.name
      })

      dimension.keyColumn = measure.name
    } else {
      buildCubeDimensionContext(dimension, entityType)
    }
  })

  if (!context.measures.length) {
    const defaultMeasure = getEntityDefaultMeasure(entityType)
    context.measures.push({...defaultMeasure, alias: defaultMeasure.name})
  }

  return context
}

/**
 * Build Dimension Context in Cube
 * 从返回结果为对象数组形式来说, 当选择同一个 Hierarchy 多个层级时, 他们的成员都是属于同一列不同行;
 *
 * @param context
 * @param entityType
 * @param row
 * @returns
 */
export function buildCubeDimensionContext(
  context: DimensionContext,
  entityType: EntityType,
): DimensionContext {
  const row = context.dimension
  const property = getEntityProperty(entityType, row)

  if (!property) {
    throw new Error(`未找到维度'${row.dimension}'`)
  }

  context.schema = property

  const _hierarchy = property.hierarchies?.find((item) =>
    row.hierarchy ? item.name === row.hierarchy : item.name === row.dimension
  )
  if (!_hierarchy) {
    throw new Error(`未找到层级结构'${row.hierarchy || row.dimension}'`)
  }
  if (context.hierarchy && context.hierarchy.name !== _hierarchy.name) {
    throw new Error(`不能同时查询不同层级结构`)
  }
  context.hierarchy = _hierarchy
  context.keyColumn = context.hierarchy.name
  context.captionColumn = context.hierarchy.caption
  context.parentKeyColumn = serializeIntrinsicName(context.dialect, context.hierarchy.name, IntrinsicMemberProperties.PARENT_UNIQUE_NAME)
  context.childrenCardinalityColumn = serializeIntrinsicName(context.dialect, context.hierarchy.name, IntrinsicMemberProperties.CHILDREN_CARDINALITY)
  const lIndex = row.level ? context.hierarchy.levels?.findIndex((item) => item.name === row.level) : 0

  if (lIndex > -1) {
    // for Hierarchy
    context.dimensionTable = context.hierarchy.primaryKeyTable || context.hierarchy.tables?.[0]?.name

    // for levels
    const startLevel = row.displayHierarchy ? 0 : lIndex
    for (let index = startLevel; index <= lIndex; index++) {
      const level = context.hierarchy.levels[index]
      context.levels.push(buildLevelContext(context, row, level, index))
    }

    // if (context.level?.name && context.level?.name !== level.name) {
    //   throw new Error(`暂时不能同时查询不同层级`)
    // }
    // context.level = level
  } else {
    throw new Error(`找不到 Level ${row.level}`)
  }

  return context
}

export function buildLevelContext(context: DimensionContext, row: Dimension, level: PropertyLevel, lIndex: number) {
  const levelContext: LevelContext = {
    level,
    selectFields: []
  }

  const hAlias = context.keyColumn
  const levelTable = level.table || context.dimensionTable
  const table = levelTable ? serializeTableAlias(context.hierarchy.name, levelTable) : context.factTable
  const nameColumn = level.nameColumn || level.column
  let captionColumn = level.captionColumn || level.nameColumn
  const levels = context.hierarchy.levels.slice(context.hierarchy.hasAll ? 1 : 0, lIndex + 1)
  if (level.levelNumber === 0 && context.hierarchy.hasAll) {
    levelContext.selectFields.push({
      expression: `'(All)'`,
      alias: hAlias
    })
    levelContext.selectFields.push({
      expression: `'All'`,
      alias: context.hierarchy.caption
    })
  }
  // else if (level.uniqueMembers) {
  //   context.selectFields.push({
  //     table,
  //     column: nameColumn,
  //     alias: hAlias
  //   })
  // }
  else {
    //
    captionColumn = captionColumn || nameColumn
    levelContext.selectFields.push({
      table,
      columns: levels.map((level) => {
        return getLevelColumn(level, table)
      }),
      alias: hAlias
    })
  }

  if (level.captionExpression?.sql?.content) {
    // Caption Expression
    levelContext.selectFields.push({
      table: level.table,
      column: captionColumn,
      expression: level.captionExpression.sql.content, // 需要判断 dialect
      alias: context.hierarchy.caption,
      cast: 'VARCHAR'
    })
  } else if (captionColumn) {
    // CaptionColumn
    levelContext.selectFields.push({
      table,
      column: captionColumn,
      alias: context.hierarchy.caption,
      cast: 'VARCHAR'
    })
  }

  // 暂时注释掉, 待解决
  // if (level.parentColumn) {
  //   context.parentKeyColumn = level.column
  //   context.parentColumn = level.parentColumn
  //   levelContext.selectFields.push({
  //     table: table + '(1)',
  //     column: nameColumn,
  //     alias: hAlias + '[parent_unique_name]'
  //   })
  // }

  row.properties?.forEach((name) => {
    const property = level.properties?.find((item) => item.name === name)
    if (property) {
      levelContext.selectFields.push({
        table,
        column: property.column,
        alias: property.name
      })
    }
  })

  // DisplayHierarchy 相关属性
  if (row.displayHierarchy) {
    // Parent
    if (level.levelNumber === 1 && context.hierarchy.hasAll) {
      levelContext.selectFields.push({
        expression: `'(All)'`,
        alias: serializeIntrinsicName(context.dialect, hAlias, IntrinsicMemberProperties.PARENT_UNIQUE_NAME)
      })
    } else {
      levelContext.selectFields.push({
        table,
        columns: levels.slice(0, levels.length - 1).map((level) => {
          return getLevelColumn(level, table)
        }),
        alias: serializeIntrinsicName(context.dialect, hAlias, IntrinsicMemberProperties.PARENT_UNIQUE_NAME)
      })
    }

    // Children cardinality
    const childrenLevels = context.hierarchy.levels.slice(context.hierarchy.hasAll ? 1 : 0, Math.min(lIndex + 2, context.hierarchy.levels.length))
    levelContext.selectFields.push({
      table,
      columns: childrenLevels.map((level) => {
        return getLevelColumn(level, table)
      }),
      alias: serializeIntrinsicName(context.dialect, hAlias, IntrinsicMemberProperties.CHILDREN_CARDINALITY),
      aggregate: AggregateFunctions.COUNT_DISTINCT
    })
  }

  return levelContext
}
