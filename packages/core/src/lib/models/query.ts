import { MemberType, Property } from '.'
import { RecursiveHierarchyData, RecursiveHierarchyType } from '../annotations/hierarchy'

/**
 * Hierarchy 结构化的字段类型, 字段包含子字段们
 */
export interface PivotColumn {
  name: string
  label?: string
  dataType?: string
  columns?: Array<PivotColumn>
  isSummary?: boolean
  // column?: string
  member?: string
  memberType?: MemberType
  uniqueName?: string
  parentUniqueName?: string
  properties?: Array<PivotColumn>
}

export interface EntitySchema {
  rows?: Array<Property & PivotColumn>
  columns: Array<Property & PivotColumn>
  analytics?: any
  recursiveHierarchy?: RecursiveHierarchyType
}

/**
 * Query 查询返回值类型
 */
export interface QueryReturn<T> {
  /**
   * @deprecated use data
   */
  results?: Array<T>
  data?: Array<T>
  schema?: EntitySchema
  /**
   * @deprecated use schema
   */
  recursiveData?: RecursiveHierarchyData<T>[]
  error?: any
}
