export function core(): string {
  return 'core';
}

export type PrimitiveType = number | string | boolean | null | undefined
export type PropertyName = string
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

  /**
   * 清除度量全部为 0 的成员
   */
  zeroSuppression?: boolean
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
