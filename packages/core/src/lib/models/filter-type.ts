import { Dimension } from "../types"


export enum FilterSelectionType {
  Multiple = 'Multiple',
  Single = 'Single',
  SingleInterval = 'SingleInterval',
  SingleRange = 'SingleRange'
}

export interface FilterRestrictions {
  nonFilterableProperties: string[]
  requiredProperties: string[]
  filterExpressionRestrictions: {
    property: Dimension
    allowedExpressions: FilterSelectionType
  }[]
}

/**
 * 树状结构的选择模式
 */
export enum TreeSelectionMode {
  Individual = 'Individual', // 每个节点独立选择
  SelfDescendants = 'SelfDescendants',
  DescendantsOnly = 'DescendantsOnly',
  SelfChildren = 'SelfChildren', // 输出所有选中的 Parent 和 Children
  ChildrenOnly = 'ChildrenOnly'
}

export enum PresentationEnum {
  Flat,
  Hierarchy
}
