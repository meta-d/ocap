import { RecursiveHierarchyType } from '../annotations/hierarchy'
import { MemberType } from './member'
import { Property } from './sdl'

/**
 * Hierarchy 结构化的字段类型, 字段包含子字段们
 * 
 * 每个 PivotColumn 应该是一个 Dimension Member, 所以它应该和 Dimension Member 有共同的属性
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
  childrenCardinality?: number
  isCell?: boolean
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
  status?: 'OK' | 'ERROR'
  data?: Array<T>
  schema?: EntitySchema
  error?: any
  stats?: {
    statements: string[]
  }
}
