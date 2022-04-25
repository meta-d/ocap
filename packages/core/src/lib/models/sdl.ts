import { Cube, Dimension } from "./schema"

export interface Schema {
  cubes?: Cube[]
  dimensions?: Dimension[]
  annotations?: any[]
  functions?: any[]
  entities?: EntityType[]
  /**
   * @deprecated use entities
   */
  entitySets?: EntitySets
}

/**
 * @deprecated use entities
 */
export interface EntitySets {
  [key: string]: EntitySet
}

/**
 * @deprecated use entities
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
    [key: string]: any
  }
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
    [name: string]: Property
  }

  label?: string

  // 数据源方言
  dialect?: any
}

export interface Property {
    name: string
}
