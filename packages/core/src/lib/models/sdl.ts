import { Annotation, IMember, Measure, PrimitiveType, Syntax } from '../types'
import { CalculatedMember, ParameterControlEnum } from './calculated'
import { Indicator } from './indicator'
import { EntityProperty, PropertyAttributes } from './property'

export interface Schema {
  name: string
  /**
   * Semantic Model Cubes
   */
  cubes?: Cube[]
  /**
   * Semantic Model Dimensions
   */
  dimensions?: PropertyDimension[]
  annotations?: any[]
  functions?: any[]
  /**
   * Runtime EntitySet
   */
  entitySets?: {
    [key: string]: EntitySet
  }
}

export interface Cube {
  __id__?: string
  name: string
  label?: string
  expression?: string
  tables?: Table[]
  dimensionUsages?: DimensionUsage[]
  dimensions?: PropertyDimension[]
  measures?: PropertyMeasure[]
  calculatedMembers?: CalculatedMember[]
}

export interface Table {
  __id__?: string
  name: string
  join?: Join
}

export interface Join {
  type: 'Left' | 'Inner' | 'Right'
  leftTable?: string
  fields: JoinField[]
  rightAlias?: string

  tables?: Array<Table>

  leftKey?: string
  rightKey?: string
}

export interface JoinField {
  leftKey: string
  rightKey: string
}

export interface SQL {
  dialect?: string,
  content?: string
}

export interface SQLExpression {
  sql: SQL
}

export type KeyExpression = SQLExpression

export type CaptionExpression = SQLExpression

export interface DimensionUsage {
  __id__?: string
  name: string
  source: string
  foreignKey: string
  label?: string
  caption?: string
  description?: string
}

/**
 * @deprecated
 */
export enum EntitySemantics {
  aggregate = 'aggregate',
  parameters = 'parameters'
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

  label?: string

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

  /**
   * @deprecated 应该移到 EntitySet 里
   */
  indicators?: Array<Indicator>

  // 数据源方言
  dialect?: any // string

  syntax?: Syntax

  /**
   * @deprecated
   */
  table?: string

  /**
   * @deprecated
   */
  expression?: string
  /**
   * @deprecated
   */
  semantics?: EntitySemantics
  /**
   * @deprecated
   */
  cube?: Cube
}

/**
 * Mondrian 仅支持三种 Dimension 类型,
 * 更丰富的语义可以通过 Semantics 来定义
 */
export enum DimensionType {
  StandardDimension = 'StandardDimension',
  TimeDimension = 'TimeDimension',
  MeasuresDimension = 'MeasuresDimension'
}

export interface Property extends EntityProperty {
  expression?: string
  foreignKey?: string
  column?: string
  type?: DimensionType | string
  description?: string
  hierarchies?: PropertyHierarchy[]
  defaultHierarchy?: string

  /**
   * 维度的属性字段
   */
  properties?: Array<EntityProperty>

  keyExpression?: KeyExpression

  /**
   * @deprecated
   */
  entitySet?: string
  /**
   * @deprecated
   */
  hierarchyNodeFor?: string
  /**
   * @deprecated
   */
  hierarchyLevelFor?: string
  /**
   * @deprecated
   */
  hierarchyParentNodeFor?: string
}

export type PropertyDimension = Property

export interface PropertyMeasure extends EntityProperty {
  formatting?: Measure['formatting']
  column?: string
  aggregator?: string
  formatString?: string
}

export interface PropertyHierarchy extends EntityProperty {
  tables?: Table[]
  join?: Join
  hasAll?: boolean
  allMemberName?: string
  primaryKey?: string
  primaryKeyTable?: string
  // Table?: Table[] | Table
  // Join?: Join

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

export interface PropertyLevel extends EntityProperty {
  column?: string
  nameColumn?: string
  captionColumn?: string
  ordinalColumn?: string
  parentColumn?: string
  nullParentValue?: number
  uniqueMembers?: boolean
  type?: string
  table?: string
  // Closure?: Closure
  // KeyExpression?: KeyExpression
  // NameExpression?: NameExpression
  // CaptionExpression?: CaptionExpression
  // OrdinalExpression?: OrdinalExpression
  // ParentExpression?: ParentExpression
  // Property?: Property[]

  levelNumber?: number
  levelCardinality?: number
  levelType?: number
  properties?: Array<LevelProperty>
  // hierarchyLevelFor?: PropertyName
  parentChild?: boolean

  captionExpression?: CaptionExpression
}

export interface LevelProperty extends PropertyAttributes {
  column?: string
  propertyExpression: SQLExpression
}

export interface ParameterProperty extends EntityProperty {
  paramType: ParameterControlEnum
  value?: PrimitiveType

  // 候选成员
  availableMembers?: Array<IMember>
}

/**
 * 
 * Entity 的 Meta 信息集合
 */
export interface EntitySet {
  __id__?: string
  /**
   * Entity 名称
   */
  name: string
  /**
   * Entity Type 定义
   */
  entityType: EntityType

  annotations?: Array<Annotation>

  indicators?: Array<Indicator>
}

export interface Catalog {
  name: string
  label: string
}
