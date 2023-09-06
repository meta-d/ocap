import { RecursiveHierarchyType } from '../annotations/hierarchy'
import { Dimension, IMember } from '../types'
import { MemberType } from './member'
import { Property } from './sdl'

/**
 * Hierarchy 结构化的字段类型, 字段包含子字段们
 * 
 * 每个 PivotColumn 应该是一个 Dimension Member, 所以它应该和 Dimension Member 有共同的属性
 */
export interface PivotColumn {
  name: string
  caption?: string
  dataType?: string
  columns?: Array<PivotColumn>
  isSummary?: boolean
  // column?: string
  // member?: string
  member?: IMember
  memberType?: MemberType
  uniqueName?: string
  parentUniqueName?: string
  childrenCardinality?: number
  /**
   * @todo 需要制定标准
   */
  isCell?: boolean
  measure?: string
  properties?: Array<PivotColumn>
}

export interface EntitySchema {
  rows?: Array<Property & PivotColumn>
  columns: Array<Property & PivotColumn>
  analytics?: any
  recursiveHierarchy?: RecursiveHierarchyType
  rowHierarchy?: string
  columnAxes?: Dimension[]
}

/**
 * Query 查询返回值类型
 */
export interface QueryReturn<T> {
  status?: 'OK' | 'ERROR'
  data?: Array<T>
  schema?: EntitySchema
  error?: any
  stats?: {
    statements?: string[]
    // any other attributes
    [key: string]: any
  }
}
