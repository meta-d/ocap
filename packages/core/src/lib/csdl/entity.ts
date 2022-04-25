import { assign, cloneDeep, isArray, isNil, isString, mergeWith } from 'lodash'
import { AggregationRole, EntityProperty } from '../models'
import {
  Dimension,
  getPropertyName,
  IMember,
  isDimension,
  isMeasure,
  Measure,
  PrimitiveType,
  PropertyName,
  PropertyPath,
  Syntax
} from '../types'
import { CalculationProperty, isCalculationProperty, ParameterControlEnum } from './calculated'
import { EntitySet } from './schema'

/**
 * Semantic annotations are used to inform the client as to which of the elements contain a phone number, a part of a name or address, or something relating to a calendar event.
 * They must not be bound, for example, to a dedicated consumption channel. They need to be available for consumption through OData, (S)QL, and so on.
 *
 * Semantic annotations complement the concept of semantic data types,
 * while semantic data types always introduce specific behavior
 * in the provider/core infrastructure (through dedicated operations or conversion functions).
 *
 * Refer [Semantics Annotations](https://help.sap.com/viewer/cc0c305d2fab47bd808adcad3ca7ee9d/7.5.9/en-US/fbcd3a59a94148f6adad80b9c97304ff.html)
 */
export interface PropertySemantic {
  name: Semantics
  value?: PropertyName | PrimitiveType
}

/**
 * https://docs.microsoft.com/en-us/analysis-services/multidimensional-models/attribute-properties-configure-attribute-types?view=asallproducts-allversions
 */
export enum Semantics {
  Account = 'Account',
  // Address
  'Address.Street' = 'Address.Street',
  'Address.PostBox' = 'Address.PostBox',
  'Address.ZipCode' = 'Address.ZipCode',
  'Address.City' = 'Address.City',
  'Address.Country' = 'Address.Country',
  'Address.SubRegion' = 'Address.SubRegion',
  'Address.Region' = 'Address.Region',
  'Amount.CurrencyCode' = 'Amount.CurrencyCode',
  'BusinessDate.At' = 'BusinessDate.At',
  'BusinessDate.From' = 'BusinessDate.From',
  'BusinessDate.To' = 'BusinessDate.To',
  /**
   * Semantics.calendar follow the iCalendar standard ([RFC5545](https://tools.ietf.org/html/rfc5545))
   */
  Calendar = 'Calendar',
  'Calendar.Year' = 'Calendar.Year',
  'Calendar.Quarter' = 'Calendar.Quarter',
  'Calendar.Month' = 'Calendar.Month',
  'Calendar.Week' = 'Calendar.Week',
  'Calendar.Day' = 'Calendar.Day',

  'CurrencyCode' = 'CurrencyCode',
  // This annotation identifies a field that identifies languages.
  Language = 'Language',

  // GeoLocation
  Geography = 'Geography',
  'GeoLocation.Latitude' = 'GeoLocation.Latitude',
  'GeoLocation.Longitude' = 'GeoLocation.Longitude',
  'Quantity.UnitOfMeasure' = 'Quantity.UnitOfMeasure',

  // This annotation identifies a human-readable text that is not necessarily language-dependent.
  Text = 'Text',
  UnitOfMeasure = 'UnitOfMeasure'

  // ... more
}

export enum PropertyDisplayFormat {
  UpperCase = 'UpperCase',
  Date = 'Date',
  NonNegative = 'NonNegative'
}

export type Multiplicity = '1' | '0..1' | '*'

export interface NxMetaData {
  entitySets: Array<EntitySet>
}

export type NxEntitySetName = string

export enum EntitySemantics {
  aggregate = 'aggregate',
  parameters = 'parameters'
}

export interface NxPropertyValue {
  Property?: Property
  Path?: PropertyPath // TODO | ValueCallback
  String?: string
  Value?: PrimitiveType
  Records?: NxPropertyValue[]
}

/**
 * 未来将对接 Cube 定义
 *
 * Entity Type 类型接口
 */
export interface EntityType {
  // entity type 名称， 一般是 entity 名称加上 'Type' 如 MyEntityType
  // 但复杂 entity 可能出现对应的多个 entityType 如 MyEntityParameters, MyEntityResult
  name?: string
  /**
   * 对应系统中的表名
   */
  table?: string

  /**
   * Entity 主键们
   * 与 Parameters 的区别
   */
  keys?: string[]
  // entity type 属性们
  properties: {
    [name: string]: Property
  }

  /**
   * 要查询 Entity 的输入参数, 通常是必输字段
   */
  parameters?: {
    [name: string]: ParameterProperty
  }

  semantics?: EntitySemantics

  label?: string

  syntax?: Syntax
  // 数据源方言
  dialect?: any

  // 自定义 SQL 语句作为 entity set 来源基础
  expression?: string
}

export interface PropertyAttributes extends EntityProperty {
  semantic?: Semantics
  /**
   * 日期 formatter
   */
  formatter?: string
  text?: Property | PropertyName
  unit?: Property | PropertyName
}

export interface PropertyHierarchyAttributes {
  hierarchyParentNodeFor: PropertyName
  hierarchyNodeFor: PropertyName
  hierarchyNodeExternalKeyFor: PropertyName
  hierarchyLevelFor: PropertyName
  hierarchyDrillStateFor: PropertyName
  hierarchyNodeDescendantCountFor: PropertyName
  hierarchyPreorderRankFor: PropertyName
  // 对应 Cube 中的 Dimension's Hierarchies
  hierarchies: Array<PropertyHierarchy>
  // 默认层次结构的唯一名称
  defaultHierarchy: PropertyName
  // dimension calculation members
  // members: Array<CalculatedMember>
}

/**
 * Property 类型接口
 * * 增加一些对 MDX XMLA 返回结构类型的支持
 */
export interface Property extends PropertyAttributes, Partial<PropertyHierarchyAttributes> {
  type?: string
  quickinfo?: string
  nullable?: boolean
  maxLength?: number
  valueList?: string
  filterable?: boolean
  filterRestriction?: string
  displayFormat?: PropertyDisplayFormat
  isAnnotation?: boolean
  // properties?: {
  //   [key: string]: Property
  // }
  properties?: Array<PropertyAttributes>
  navigation?: string
  /**
   * 所属的 EntitySet
   */
  entitySet?: NxEntitySetName
}

export interface PropertyMeasure extends Property {
  formatting?: Measure['formatting']
}

export interface PropertyHierarchy extends PropertyAttributes {
  hierarchyCardinality?: number
  /**
   * 默认成员, 当上线文没有设置此维度的成员时默认取此成员
   */
  defaultMember?: string
  /**
   * 根成员, 代表所有值的汇总
   */
  allMember?: string
  levels?: Array<PropertyLevel>
}

export interface PropertyLevel extends PropertyAttributes {
  levelNumber: number
  levelCardinality?: number
  levelType?: number
  properties?: Array<PropertyAttributes>
  // hierarchyLevelFor?: PropertyName
  parentChild?: boolean
}

export interface ParameterProperty extends PropertyAttributes {
  paramType: ParameterControlEnum
  value?: PrimitiveType

  // 候选成员
  availableMembers?: Array<IMember>
}

/**
 * EntitySet 之间的关联关系
 */
export interface AssociationSet {
  navigationProperty: string
  from: {
    multiplicity: Multiplicity
    entitySet: EntitySet
  }
  to: {
    multiplicity: Multiplicity
    entitySet: EntitySet
  }
}

/**
 * Navigation or Relation
 * [OData Version 4.0 Part 3: Common Schema Definition Language (CSDL) - Navigation Property](http://docs.oasis-open.org/odata/odata/v4.0/cos01/part3-csdl/odata-v4.0-cos01-part3-csdl.html)
 */
export interface NavigationProperty extends Property {
  // 指向 referenced entitySet
  referentialType: NxEntitySetName
  // 简单起见: 先支持一个字段绑定
  referentialConstraint: {
    property: string
    referencedProperty: string
  }
}

// type Guards
export const isNavigationProperty = (toBe): toBe is NavigationProperty =>
  !isNil((toBe as NavigationProperty)?.referentialType)

/**
 * Property 类型接口
 * @deprecated 使用 CalculationProperty 中类型为 Calculated 的字段类型
 */
export interface ExpressionProperty extends Property {
  // Calculated Expression
  expression: string
}

// type Guards
/**
 * @deprecated 使用 isCalculationProperty
 */
export const isExpressionProperty = (toBe): toBe is ExpressionProperty =>
  !isNil((toBe as ExpressionProperty)?.expression)

export function getEntityProperties(entityType: EntityType): Property[] {
  if (isNil(entityType?.properties)) {
    return []
  }
  return Object.values(entityType?.properties)
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
 * 通过字段名或者 dimension 配置获取 dimension property
 */
export function getEntityProperty<T = Property>(entityType: EntityType, path: PropertyPath): T {
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
export function getEntityProperty2<T extends PropertyAttributes = Property>(
  entityType: EntityType,
  path: PropertyPath
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
  return Object.values(entityType?.properties).filter((item) => item.role === AggregationRole.dimension)
}

export function getEntityHierarchies(entityType: EntityType): Property[] {
  if (isNil(entityType?.properties)) {
    return []
  }
  return Object.values(entityType?.properties).filter((item) => item.role === AggregationRole.hierarchy)
}

export function getEntityDimensionAndHierarchies(entityType: EntityType): Property[] {
  if (isNil(entityType?.properties)) {
    return []
  }
  return Object.values(entityType?.properties).filter(
    (item) => item.role === AggregationRole.dimension || item.role === AggregationRole.hierarchy
  )
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
    (property) => property.role === AggregationRole.measure && !property.hidden
  )
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
        .find((item) => item.name === dimension.dimension)
        ?.hierarchies?.find((item) => item.name === dimension.hierarchy)
        ?.levels?.find((item) => item.name === dimension.level)
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

export function hasLevel(dimension: PropertyPath) {
  return isDimension(dimension) ? !!dimension.level : false
}

export const isPropertyLevel = (toBe): toBe is PropertyLevel => toBe.aggregationRole === AggregationRole.level

export function isSemanticCalendar(property: Property): boolean {
  return property?.semantic && Semantics[property.semantic].startsWith('Calendar')
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

export function getPropertyTextName(property: Property) {
  return isString(property?.text) ? property.text : property?.text?.name
}
export function getPropertyUnitName(property: Property) {
  return isString(property?.unit) ? property.unit : property?.unit?.name
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
        label: entityType.properties[key].label,
        children: entityType.properties[key].hierarchies?.map((hier) => {
          return {
            value: hier.name,
            label: hier.label,
            isLeaf: true
          }
        })
      }
    })
}

export function getMemberFromRow(row: unknown, property: Property) {
  const label = getPropertyTextName(property)
  return {
    value: row[property.name],
    label: label ? row[label] : null
  }
}

export const isParameterProperty = (toBe): toBe is ParameterProperty => !isNil(toBe?.paramType)

/**
 * 获取实体类型中的日历层级, 如果没有指定层级名称则取默认层级
 *
 * @param entityType
 * @param param1
 * @returns
 */
export function getEntityCalendarHierarchy(
  entityType: EntityType,
  { dimension, hierarchy }: Dimension
): PropertyHierarchy {
  const dProperty = getEntityProperty(entityType, dimension)
  if (hierarchy) {
    return dProperty.hierarchies.find((item) => item.name === hierarchy)
  }

  return dProperty.hierarchies.find((item) => item.name === dProperty.defaultHierarchy)
}

export function getEntityDefaultMeasure(entityType: EntityType) {
  return getEntityMeasures(entityType)[0]
}
