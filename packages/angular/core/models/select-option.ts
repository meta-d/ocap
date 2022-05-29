export interface ISelectOption<T = unknown> {
  value: T
  label?: string
  selected?: boolean
}

/**
 * 树状结构的选择模式
 */
export enum TreeSelectionMode {
  Individual = 'Individual', // 每个节点独立选择
  ParentOnly = 'ParentOnly', // 只输出 Parent
  LeafOnly = 'LeafOnly', // 只输出 Leaf
  ParentChild = 'ParentChild' // 输出所有选中的 Parent 和 Children
}
