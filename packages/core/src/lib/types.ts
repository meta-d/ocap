import { isNil, isString } from "lodash"
import { Observable } from "rxjs"
import { v4 as uuidv4 } from 'uuid'
import { OrderBy } from "./orderby"

export type HttpHeaders = { [key: string]: string | string[] }
export type PrimitiveType = number | string | boolean | null | undefined
export type UUID = string
export type PropertyName = string
export const C_MEASURES = 'Measures'

export enum Syntax {
  SQL = 'SQL',
  JSON = 'JSON'
}

export interface IMember {
  label?: string
  value: PrimitiveType
}

export enum DisplayBehaviour {
  descriptionAndId = 'descriptionAndId',
  descriptionOnly = 'descriptionOnly',
  idAndDescription = 'idAndDescription',
  idOnly = 'idOnly',
  auto = ''
}

export type Member = PropertyName | IMember

export type BaseProperty = {
  dimension: PropertyName
  /**
   * 如当 Dimension = "Measures" 时可以设置 members 为 ["Gross Margin", "Discount"] 等度量字段名
   * 也可以为 dimension 设置固定的成员
   */
  members?: Member[]
}

export type Dimension = BaseProperty &
  Partial<{
    /**
     * 对 Dimension 信息的分类命名 （有些情况下需要区分相同的 Dimension 的不同用途）
     */
    name: string
    hierarchy: PropertyName
    level: PropertyName
    /**
     * displayBehaviour 中所要显示文本字段
     */
    label: PropertyName
    /**
     * 显示为...
     */
    displayBehaviour: DisplayBehaviour

    /**
     * 清除度量全部为 NULL 的成员
     */
    zeroSuppression?: boolean

    /**
     * 是否显示无值数据, 在 MDX 中为 `[#]` 的成员
     */
    unbookedData: boolean
    /**
     * 显示维度为 Hierarchy
     */
    displayHierarchy: boolean
    /**
     * 维度属性字段们
     */
    properties: Array<PropertyName>
    /**
     * 参数名称, 指向 EntityType.parameters
     */
    parameter: string
    /**
     * 排除 members 中的成员
     */
    exclude?: boolean
  }>
/**
 * @deprecated use Dimension
 */
export type PropertyPath = PropertyName | Dimension | Measure

/**
 * Measure 字段结构会使用 Dimension 中的 dimension, members, zeroSuppression 属性
 */
export type Measure = BaseProperty & {
  measure: PropertyName
  formatting?: {
    // scale: string
    // scaleFormatting: string
    shortNumber?: boolean
    decimal?: number
    // showSignAs: string
    unit?: string
    useUnderlyingUnit?: boolean
  }
}

/**
 * 全部 Annotation 的抽象接口
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Annotation {}

export enum Drill {
  Children, // 子成员, distance 默认为 1
  SelfAndChildren, // 自己和子成员, distance 默认为 1
  Descendants, // 所有后代成员
  SelfAndDescendants, // 自己和所有后代成员
  Siblings, // 自己兄弟成员
  Leaves, // 后代中的叶子成员
  Ancestor // 父级成员, distance 默认为 1
}

export interface ISlicer {
  dimension?: Dimension
  exclude?: boolean
  members?: IMember[]
  // drill
  drill?: Drill
  // 下钻到的层级距离本节点级数, 默认为 1 即下一级, drill distance of the member
  distance?: number
}


export enum FilterOperator {
  // All = 'All',
  // Any = 'Any',
  BT = 'BT',
  EQ = 'EQ', //
  GE = 'GE', //
  GT = 'GT', //
  LE = 'LE', //
  LT = 'LT', //
  /**
   * FilterOperator "Not Between"
   * Used to filter all entries, which are not between the given boundaries.
   * The filter result does not contains the boundaries,
   * but only entries outside of the boundaries.
   * The order of the entries in the filter results is based on their occurence in the input list.
   * Note, when used on strings: The String comparison is based on lexicographical ordering.
   * Characters are ranked in their alphabetical order. Words with the same preceding
   * substring are ordered based on their length e.g. "Chris" comes before "Christian".
   */
  // NB = 'NB',
  NE = 'NE', // not equals
  Contains = 'Contains',
  EndsWith = 'EndsWith',
  // NotContains = 'NotContains',    // not contains
  // NotEndsWith = 'NotEndsWith',    // not ends with
  // NotStartsWith = 'NotStartsWith',  // not starts with
  StartsWith = 'StartsWith' // starts with
}

/**
 * 所有过滤条件的接口类型
 */
export interface IFilter extends ISlicer {
  // 过滤条件的类别, 如 name = 'time' for date or week or month or year
  name?: string

  operator?: FilterOperator | any

  /**
   * @deprecated 替换成 {FilteringLogic} 类型的字段
   */
  and?: boolean
}

export enum FilteringLogic {
  And,
  Or
}

export interface IAdvancedFilter extends IFilter {
  filteringLogic: FilteringLogic
  children: Array<IFilter>
}

export enum AdvancedSlicerOperator {
  Equal = 'Equal',
  NotEqual = 'NotEqual',
  LessThan = 'LessThan',
  GreaterThan = 'GreaterThan',
  LessEqual = 'LessEqual',
  GreaterEqual = 'GreaterEqual',
  Between = 'Between',
  NotBetween = 'NotBetween',
  TopCount = 'TopCount',
  BottomCount = 'BottomCount',
  TopPercent = 'TopPercent',
  BottomPercent = 'BottomPercent',
  TopSum = 'TopSum',
  BottomSum = 'BottomSum'
}

export interface AdvancedSlicer extends IFilter {
  context?: Array<Dimension>
  operator: AdvancedSlicerOperator
  measure: PropertyName
  value: PrimitiveType | PrimitiveType[]
  other?: boolean
}

export type EntityKey<T> =
  | {
      readonly [P in keyof T]?: T[P]
    }
  | string
  | number

/**
 * Entity query 的选项
 */
export interface QueryOptions<T = any> {
  parameters?: EntityKey<T>
  rows?: Array<Dimension>
  columns?: Array<Dimension>
  /**
   * @deprecated use rows and columns
   */
  selects?: Array<Dimension>
  orderbys?: Array<OrderBy>

  filterString?: string
  filters?: Array<ISlicer>
  // TODO 需要删除
  top?: number
  skip?: number
  search?: string
  params?: Array<string>

  // 分页 TODO
  paging?: {
    top?: number
    skip?: number
    cursor?: string
    before?: string
    after?: string
    last?: number
  }
  // 原始 SQL MDX 语句
  statement?: string
}

// type Guards
export const isPropertyPath = (toBe): toBe is PropertyPath => !isNil((toBe as Dimension)?.dimension) || isString(toBe)
export const isDimension = (toBe): toBe is Dimension =>
  !isNil((toBe as Dimension)?.dimension) && toBe.dimension !== C_MEASURES
export const isMeasure = (toBe): toBe is Measure => toBe?.dimension === C_MEASURES
export const isUnbookedData = (toBe: PropertyPath): boolean => {
  if (isDimension(toBe)) {
    return !!toBe.unbookedData
  }
  return false
}
export const isSlicer = (toBe): toBe is ISlicer =>
  !isNil((toBe as ISlicer)?.dimension) && !isNil((toBe as ISlicer)?.members)
export const isFilter = (toBe): toBe is IFilter =>
  (!isNil((toBe as IFilter)?.dimension) || !isNil((toBe as IFilter)?.dimension)) && !isNil((toBe as IFilter)?.operator)
export const isAdvancedFilter = (toBe): toBe is IAdvancedFilter => !isNil((toBe as IAdvancedFilter)?.filteringLogic)
export const isAdvancedSlicer = (toBe): toBe is AdvancedSlicer =>
  !isNil(AdvancedSlicerOperator[(toBe as AdvancedSlicer)?.operator])

// Helpers
export function getPropertyName(path: PropertyPath) {
  return isString(path) ? path : isDimension(path) ? path?.dimension : path?.measure
}

export function getPropertyHierarchy(path: PropertyPath) {
  return isString(path) ? path : isDimension(path) ? path?.hierarchy || path?.dimension : null
}

export function getPropertyMeasure(path: Measure | PropertyName) {
  return isString(path) ? path : path?.measure
}

export function getPropertyDisplayBehaviour(name: PropertyPath) {
  if (isDimension(name)) {
    return name.displayBehaviour
  }

  return null
}

export function uuid(): UUID {
  return uuidv4()
}

export function displayByBehaviour(option: IMember, behaviour?: DisplayBehaviour): string {
  switch (behaviour) {
    case DisplayBehaviour.descriptionAndId:
      return `${option.label || ''}(${option.value})`
    case DisplayBehaviour.descriptionOnly:
      return `${option.label || ''}`
    case DisplayBehaviour.idAndDescription:
      return `${option.value}(${option.label || ''})`
    case DisplayBehaviour.idOnly:
      return `${option.value}`
    default:
      return `${option.label || option.value}`
  }
}

/**
 * Service 初始化过程的通用接口
 */
export interface ServiceInit {
  /**
   * Service 初始化方法
   */
  onInit(): Observable<any>
  /**
   * 可监听的初始化完成状态
   */
  onAfterServiceInit(): Observable<void>
}