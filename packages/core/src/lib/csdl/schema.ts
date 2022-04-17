import { Annotation } from '../types'
import { EntityType } from './entity'

export interface Catalog {
  name: string
  label: string
}

export interface EDMSchema {
  Annotations?: any[]
  Function?: any[]
  entitySets?: EntitySets
}

export interface EntitySets {
  [key: string]: EntitySet
}

/**
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
  /**
   * Entity 相关注解
   */
  annotations?: {
    /**
     * value 为 string 则可以是指向另外一个 Annotation 的 path, 如 `RelatedRecursiveHierarchy#A` = `RecursiveHierarchy#B`
     */
    [key: string]: Annotation
  }
  mock?: {
    data?: any[]
    members?: {
      [entity: string]: any[]
    }
  }
}
