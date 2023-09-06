import { Cube, PropertyDimension, PropertyHierarchy, PropertyMeasure } from '@metad/ocap-core'
import { SchemaState } from '@metad/story/designer'

export interface EntitySchemaState<T> extends SchemaState {
  entity: string
  /**
   * 主建模的 id 属性
   */
  id: string
  /**
   * 主建模属性, 如 Dimension Hierarchy Level 等
   */
  modeling: T
  /**
   * 运行时属性, 非语义建模属性
   */
  property: any
}

export interface CubeSchemaState<T> extends EntitySchemaState<T> {
  cube: Cube
  dimension: PropertyDimension
  hierarchy: PropertyHierarchy
  hierarchies: Array<PropertyHierarchy>
}
