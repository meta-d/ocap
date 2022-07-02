import {
  AggregationRole,
  CalculationType,
  Cube,
  C_MEASURES,
  Dimension,
  EntityType,
  getEntityProperty,
  isMeasure,
  PropertyDimension,
  PropertyMeasure,
  QueryOptions,
} from '@metad/ocap-core'
import { compileDimensionSchema, DimensionContext, getLevelColumn } from './dimension'

export function compileCubeSchema(entity: string, cube: Cube, dimensions?: PropertyDimension[]): EntityType {
  const properties = {}

  cube.dimensionUsages?.forEach((usage) => {
    const dimension = dimensions?.find((item) => item.name === usage.source)
    if (dimension) {
      const property = compileDimensionSchema(entity, {
        ...dimension,
        name: usage.name,
        foreignKey: usage.foreignKey || dimension.foreignKey
      })
      properties[property.name] = property
    } else {
      throw new Error(`Can't found dimension for source '${usage.source}'`)
    }
  })

  cube.dimensions?.forEach((dimension) => {
    const property = compileDimensionSchema(entity, dimension)
    properties[property.name] = property
  })

  cube.measures?.forEach((measure) => {
    properties[measure.name] = {
      ...measure,
      role: AggregationRole.measure
    }
  })

  cube.calculatedMembers?.filter((member) => member.visible).forEach((calculatedMember) => {
    if (calculatedMember.dimension === C_MEASURES) {
      properties[calculatedMember.name] = {
        ...calculatedMember,
        role: AggregationRole.measure,
        dataType: 'number',
        calculationType: CalculationType.Calculated
      }
    }
  })

  return {
    name: entity,
    label: cube.label,
    properties,
  }
}

export interface CubeContext {
  schema: Cube
  entityType: EntityType
  factTable: string
  dimensions: DimensionContext[]
  measures: Array<{alias: string} & PropertyMeasure>
}

export function CubeFactTable(cube: Cube) {
  return cube.tables?.[0]?.name
}

export function buildCubeContext(cube: Cube, options: QueryOptions, entityType: EntityType, dialect: string): CubeContext {
  const factTable = CubeFactTable(cube)
  if (!factTable) {
    throw new Error(`在模型中未找到事实表`)
  }

  const context = { entityType, dimensions: [], measures: [], factTable } as CubeContext

  ;[...(options.rows ?? []), ...(options.columns ?? [])].forEach((row) => {
    if (isMeasure(row)) {
      const measure = getEntityProperty(entityType, row)
      if (!measure) {
        throw new Error(`未找到度量'${row.measure}'`)
      }
      context.measures.push({
        ...measure,
        alias: measure.name
      })
    } else {
      
      let dimension = context.dimensions.find((item) => item.dimension.dimension === row.dimension)
      if (!dimension) {
        dimension = { factTable, selectFields: [] } as DimensionContext
        context.dimensions.push(dimension)
      }
      buildCubeDimensionContext(dimension, entityType, row)
    }
  })

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
  row: Dimension
): DimensionContext {
  const property = getEntityProperty(entityType, row)
  if (!property) {
    throw new Error(`未找到维度'${row.dimension}'`)
  }

  context.schema = property
  context.dimension = row

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

  const lIndex = row.level ? context.hierarchy.levels?.findIndex((item) => item.name === row.level) : 0

  if (lIndex > -1) {
    const level = context.hierarchy.levels[lIndex]
    if (context.level?.name && context.level?.name !== level.name) {
      throw new Error(`暂时不能同时查询不同层级`)
    }
    context.level = level
    context.dimensionTable = context.hierarchy.primaryKeyTable || context.hierarchy.tables?.[0]?.name
    const hAlias = context.hierarchy.name
    const table = level.table || context.dimensionTable || context.factTable
    const nameColumn = level.nameColumn || level.column
    let captionColumn = level.captionColumn || level.nameColumn
    if (level.levelNumber === 0 && context.hierarchy.hasAll) {
      context.selectFields.push({
        expression: `'(All)'`,
        alias: hAlias
      })
      context.selectFields.push({
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
      context.selectFields.push({
        table,
        columns: context.hierarchy.levels.slice(context.hierarchy.hasAll ? 1 : 0, lIndex + 1).map((level) => {
          return getLevelColumn(level, table)
        }),
        alias: hAlias
      })
    }
    
    if (level.captionExpression?.sql?.content) {
      // Caption Expression
      context.selectFields.push({
        table: level.table,
        column: captionColumn,
        expression: level.captionExpression.sql.content, // 需要判断 dialect
        alias: hAlias + '.[MEMBER_CAPTION]' // 先与 MDX 命名保持一致
      })
    } else if (captionColumn) {
      // CaptionColumn
      context.selectFields.push({
        table,
        column: captionColumn,
        alias: hAlias + '.[MEMBER_CAPTION]' // 先与 MDX 命名保持一致
      })
    }

    if (level.parentColumn) {
      context.parentKeyColumn = level.column
      context.parentColumn = level.parentColumn
      context.selectFields.push({
        table: table + '(1)',
        column: nameColumn,
        alias: hAlias + '.[PARENT_UNIQUE_NAME]' // 先与 MDX 命名保持一致
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
