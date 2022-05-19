import { assign, cloneDeep, isArray, isEmpty, isNil, isString, mergeWith, omitBy } from 'lodash'
import { Semantics } from '../annotations'
import { Dimension, getPropertyName, isDimension, ISlicer, isMeasure, Measure, Member, PropertyPath } from '../types'
import { CalculationProperty, CalculationType, isCalculationProperty } from './calculated'
import { AggregationRole, EntityProperty, PropertyAttributes } from './property'
import {
  Cube,
  DimensionUsage,
  EntitySet,
  EntityType,
  ParameterProperty,
  Property,
  PropertyDimension,
  PropertyHierarchy,
  PropertyLevel,
  PropertyMeasure,
  Schema
} from './sdl'

// export const isCalculatedMember = (toBe): toBe is CalculatedMember =>
//   (!isNil((toBe as CalculatedMember)?.dimension) || !isNil((toBe as CalculatedMember)?.hierarchy)) && !isNil((toBe as CalculatedMember)?.formula)

// export function formatCalculatedMemberName(member: CalculatedMember) {
//   if (member.dimension === C_MEASURES) {
//     return `[Measures].[${member.name}]`
//   }
//   return `${member.hierarchy || member.dimension}.[${member.name}]`
// }

export function serializeUniqueName(dimension: string, hierarchy?: string, level?: string) {
  const name = !!hierarchy && dimension !== hierarchy ? `[${dimension}.${hierarchy}]` : `[${dimension}]`
  if (level) {
    return `${name}.[${level}]`
  }
  return name
}

/**
 * 通过字段名或者 dimension 配置获取 dimension property
 */
export function getEntityProperty<T = Property>(entityType: EntityType, path: Dimension | Measure | string): T {
  return (entityType?.properties[getPropertyName(path)] ??
    entityType?.parameters?.[getPropertyName(path)]) as unknown as T
}

/**
 * 获取不仅是 dimension 的具体属性字段如 level hierarchy parameter measure 等, 而 {@link getEntityProperty} 仅获取 dimension, measure 字段
 *
 * @param entityType
 * @param path
 * @returns
 */
export function getEntityProperty2<T extends PropertyAttributes = EntityProperty>(
  entityType: EntityType,
  path: Dimension | Measure | string
): T {
  if (isString(path)) {
    return (Object.values(entityType?.properties ?? {}).reduce(
      (prev, dimension) =>
        prev ??
        (dimension.name === path
          ? dimension
          : dimension.hierarchies?.reduce(
              (prev, hierarchy) =>
                prev ??
                (hierarchy.name === path
                  ? hierarchy
                  : hierarchy.levels?.reduce((prev, level) => prev ?? (level.name === path ? level : null), null)),
              null
            )),
      null
    ) ?? entityType?.parameters?.[path]) as unknown as T
  }

  if (isMeasure(path)) {
    return entityType?.properties[path.measure] as T
  }

  return (Object.values(entityType?.properties ?? {}).reduce((prev, dimension) => {
    return (
      prev ??
      (dimension.name === path.dimension
        ? path.hierarchy
          ? dimension.hierarchies?.reduce(
              (prev, hierarchy) =>
                prev ??
                (hierarchy.name === path.hierarchy
                  ? path.level
                    ? hierarchy.levels?.reduce(
                        (prev, level) => prev ?? (level.name === path.level ? level : null),
                        null
                      )
                    : hierarchy
                  : null),
              null
            )
          : dimension
        : null)
    )
  }, null) ?? entityType?.parameters?.[path.dimension]) as unknown as T
}

export function getEntityDimensions(entityType: EntityType): Property[] {
  if (isNil(entityType?.properties)) {
    return []
  }
  return Object.values(entityType?.properties).filter((item) => item.role === AggregationRole.dimension && isVisible(item))
}

export function getEntityHierarchies(entityType: EntityType): Property[] {
  if (isNil(entityType?.properties)) {
    return []
  }
  return Object.values(entityType?.properties).filter((item) => item.role === AggregationRole.hierarchy)
}

export function getEntityDimensionAndHierarchies(entityType: EntityType): Property[] {
  const results = []
  if (isNil(entityType?.properties)) {
    return []
  }
  
  Object.values(entityType.properties).forEach((property) => {
    if (property.role === AggregationRole.dimension) {
      results.push(property)

      property.hierarchies?.forEach((hierarchy) => {
        results.push(hierarchy)
      })
    }
  })
  return results
}

/**
 * 返回 EntityType 中的度量字段列表
 * @param entityType
 * @returns
 */
export function getEntityMeasures(entityType: EntityType): PropertyMeasure[] {
  if (isNil(entityType?.properties)) {
    return []
  }
  return Object.values(entityType.properties).filter(
    (property) => property.role === AggregationRole.measure && (isNil(property.visible) || property.visible)
  )
}

export function getEntityDefaultMeasure(entityType: EntityType) {
  return getEntityMeasures(entityType)[0]
}

/**
 *
 * @param entityType
 * @param hierarchy
 * @returns
 */
export function getEntityHierarchy(entityType: EntityType, { dimension, hierarchy }: Dimension): PropertyHierarchy {
  return isNil(entityType?.properties)
    ? null
    : Object.values(entityType.properties)
        .find((item) => item.name === dimension)
        ?.hierarchies?.find((item) => item.name === (hierarchy || dimension))
}

export function getEntityLevel(entityType: EntityType, dimension: Dimension): PropertyLevel {
  return isNil(entityType?.properties)
    ? null
    : Object.values(entityType.properties)
        .find((item) => item.name === dimension?.dimension)
        ?.hierarchies?.find((item) => item.name === dimension?.hierarchy)
        ?.levels?.find((item) => item.name === dimension?.level)
}

export function getEntityCalculations(entityType: EntityType): CalculationProperty[] {
  if (isNil(entityType?.properties)) {
    return []
  }
  return Object.values(entityType.properties).filter((property) =>
    isCalculationProperty(property)
  ) as CalculationProperty[]
}

export function getEntityParameters(entityType: EntityType): ParameterProperty[] {
  if (isNil(entityType?.parameters)) {
    return []
  }
  return Object.values(entityType.parameters)
}

/**
 * 查找 Hierarchy 里的 levels 下的 property
 *
 * @param hierarchy
 * @param name
 * @returns
 */
export function getHierarchyProperty(hierarchy: PropertyHierarchy, name: string) {
  let property = null
  hierarchy?.levels?.find((level) => {
    return (property = level.properties?.find((item) => item.name === name))
  })
  return property
}

export function getPropertyTextName(property: Property) {
  return isString(property?.text) ? property.text : property?.text?.name
}
export function getPropertyUnitName(property: Property) {
  return isString(property?.unit) ? property.unit : property?.unit?.name
}

/**
 * 获取维度的文本字段
 * 
 * @param entityType 
 * @param dimension 
 * @returns 
 */
export function getDimensionLabel(entityType: EntityType, dimension: Dimension) {
  if (dimension.label) {
    return dimension.label
  }
  const property = getEntityProperty(entityType, dimension)
  const label = getPropertyTextName(property)
  if (label) {
    return label
  }

  // Default dimension caption rule: `${dimension}_Text` (暂时, 以后可以重命名)
  return dimension.dimension + '_Text'
}

/**
 * TODO 有问题
 * @param member
 * @returns
 */
export function getMemberValue(member: Member): string {
  return isString(member) ? member : (member?.value as string)
}

export function hasLevel(dimension: PropertyPath) {
  return isDimension(dimension) ? !!dimension.level : false
}

export const isPropertyLevel = (toBe): toBe is PropertyLevel => toBe.aggregationRole === AggregationRole.level

export function isSemanticCalendar(property: Property): boolean {
  return property?.semantic && Semantics[property.semantic].startsWith('Calendar')
}

/**
 * 可以比较两个 PropertyPath 对象作为 Property 是否相同
 *
 * > 目前 level 属性中存储的就是全称, 不排除未来改为只有 level 的信息
 *
 * @param path
 * @returns
 */
export function stringifyProperty(path: PropertyPath) {
  return isString(path) ? path : isDimension(path) ? `${path.level || path.hierarchy || path.dimension}` : path.measure
}

// Convertion
export function propertyPath2Dimension(path: PropertyPath, entityType: EntityType): Dimension {
  if (isString(path)) {
    const d = {} as Dimension
    if (!isNil(entityType?.properties)) {
      Object.values(entityType.properties).find((dimension) => {
        if (dimension.name === path) {
          d.dimension = path
          return true
        }
        return dimension.hierarchies?.find((hierarchy) => {
          if (hierarchy.name === path) {
            d.dimension = dimension.name
            d.hierarchy = path
            return true
          }
          return hierarchy.levels?.find((level) => {
            if (level.name === path) {
              d.dimension = dimension.name
              d.hierarchy = hierarchy.name
              d.level = path
              return true
            }
            return false
          })
        })
      })
    }
    return d
  }

  return path
}

/**
 * 根据 ID 从 Cube 中找到 Hierarchy
 *
 * @param cube
 * @param id
 * @returns
 */
export function getHierarchyById(cube: Cube, id: string): PropertyHierarchy {
  return cube.dimensions?.reduce(
    (prev, current) =>
      prev ??
      current.hierarchies?.reduce((prevH, currentH) => prevH ?? (currentH.__id__ === id ? currentH : null), null),
    null
  ) as PropertyHierarchy
}

export function getLevelById(cube: Cube, id: string): PropertyLevel {
  return cube.dimensions?.reduce(
    (prev, current) =>
      prev ??
      current.hierarchies?.reduce(
        (prevH, currentH) =>
          prevH ??
          currentH.levels?.reduce((prevL, currentL) => prevL ?? (currentL.__id__ === id ? currentL : null), null),
        null
      ),
    null
  ) as PropertyLevel
}

export function getCubeProperty(cube: Cube, role: AggregationRole, id: string) {
  if (role === AggregationRole.dimension) {
    return cube.dimensions?.find((item) => item.__id__ === id)
  }

  if (role === AggregationRole.hierarchy) {
    return getHierarchyById(cube, id)
  }

  if (role === AggregationRole.level) {
    return getLevelById(cube, id)
  }

  if (role === AggregationRole.measure) {
    return cube.measures?.find((item) => item.__id__ === id)
  }

  return null
}

/**
 * 获取维度列表中指定层级 ID 所属层级结构
 *
 * @param dimensions 维度列表
 * @param id 层级的 ID
 * @returns 层级所属的层级结构
 */
export function getLevelsHierarchy(dimensions: PropertyDimension[], id: string): PropertyHierarchy {
  return dimensions?.reduce(
    (prevDim, currentDim) =>
      prevDim ??
      currentDim.hierarchies?.reduce(
        (prevHier, currentHier) =>
          prevHier ?? (currentHier.levels?.find((level) => level.__id__ === id) ? currentHier : null),
        null
      ),
    null
  )
}

export function isVisible(property: PropertyAttributes) {
  return property.visible || isNil(property.visible)
}

// merge EntityType
export function mergeEntityType(a: EntityType, b: EntityType): EntityType {
  // for properties
  function customizer(objValue, srcValue) {
    if (isArray(objValue) && isArray(srcValue)) {
      srcValue.forEach((item) => {
        const obj = objValue.find((obj) => obj.name === item.name)
        if (obj) {
          mergeWith(obj, item, customizer)
        } else {
          objValue.push(item)
        }
      })
      return objValue
    }
    return undefined
  }

  const entityType = {
    ...a,
    ...b,
    properties: mergeWith(cloneDeep(a.properties), b?.properties, customizer)
  }

  // merge hierarchy and level
  getEntityDimensions(entityType).forEach((dimension) => {
    dimension.hierarchies?.forEach((hierarchy) => {
      // assign(hierarchy, omit(entityType.properties[hierarchy.name], ['levels', 'hierarchies']))
      hierarchy.levels?.forEach((level) => {
        assign(level, entityType.properties[level.name])
      })
    })
  })

  return entityType
}

export function mergeEntitySets(a: {[key: string]: EntitySet}, b: {[key: string]: EntitySet}): {[key: string]: EntitySet} {
  const result = {}
  Object.keys(a).forEach((aKey) => {
    result[aKey] = b[aKey] ? mergeEntitySet(a[aKey], b[aKey]) : a[aKey]
  })
  Object.keys(b).forEach((bKey) => {
    if (!a[bKey]) {
      result[bKey] = b[bKey]
    }
  })

  return result
}

/**
 * 暂时只有 merge entityType
 * 
 * @param a 
 * @param b 
 * @returns 
 */
export function mergeEntitySet(a: EntitySet, b: EntitySet): EntitySet {
  return {
    ...omitBy(a, isEmpty),
    ...omitBy(b, isEmpty),
    entityType: (a?.entityType && b?.entityType) ? mergeEntityType(a.entityType, b.entityType) : (a?.entityType ?? b?.entityType)
  } as EntitySet
}

/**
 * @deprecated
 *
 * @param a
 * @param b
 * @returns
 */
export function mergeSDLSchema(a: Schema, b: Schema) {
  return {
    ...a,
    ...b
  }
}

export function mergeEntityTypeCube(entityType: EntityType, cube: Cube) {
  const properties = { ...entityType.properties }
  // 暂时无法统一 XMLA dimension name
  cube?.dimensions?.forEach((dim) => {
    properties[dim.name] = {
      ...(properties[dim.name] ?? {}),
      ...dim,
      role: AggregationRole.dimension
    }
  })

  cube?.measures?.forEach((item) => {
    properties[item.name] = {
      ...(properties[item.name] ?? {}),
      ...item,
      role: AggregationRole.measure
    }
  })

  cube?.calculatedMembers?.forEach((item) => {
    properties[item.name] = {
      ...(properties[item.name] ?? {}),
      ...item,
      role: AggregationRole.measure,
      calculationType: CalculationType.Calculated
    } as CalculationProperty
  })

  return {
    ...entityType,
    properties
  }
}

export function convertSlicerToDimension(slicer: ISlicer): Dimension {
  if (!slicer?.dimension) {
    return null
  }

  return {
    ...slicer.dimension,
    members: slicer.members,
    exclude: slicer.exclude
  }
}

export function mapEntityTypeHierarchy2Tree(entityType: EntityType) {
  if (isNil(entityType?.properties)) {
    return []
  }
  return Object.keys(entityType.properties)
    .filter((key) => entityType.properties[key].role === AggregationRole.dimension)
    .map((key) => {
      return {
        value: entityType.properties[key].name,
        label: entityType.properties[key].label || entityType.properties[key].name,
        children: entityType.properties[key].hierarchies?.map((hier) => {
          return {
            value: hier.name,
            label: hier.label || hier.name,
            isLeaf: true
          }
        })
      }
    })
}

// Type Guards
export const isDimensionUsage = (toBe): toBe is DimensionUsage =>
  !isNil((toBe as DimensionUsage)?.source)

export const isPropertyMeasure = (toBe): toBe is PropertyMeasure => (toBe as PropertyMeasure)?.role === AggregationRole.measure