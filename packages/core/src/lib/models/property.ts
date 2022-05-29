import { Semantics } from "../annotations"
import { BaseProperty } from "../types"

export enum AggregationRole {
  dimension = 'dimension',
  hierarchy = 'hierarchy',
  level = 'level',
  measure = 'measure',
  text = 'text'
}

export interface PropertyAttributes {
  __id__?: string
  uniqueName?: string
  name: string
  label?: string
  /**
   * The caption field
   */
  caption?: string
  role?: AggregationRole
  /**
   * Property is in Runtime only, not in Semantic Model
   */
  rt?: boolean

  /**
   * Visible Property
   */
  visible?: boolean
}

export interface EntityProperty extends BaseProperty, PropertyAttributes {
  description?: string
  dataType?: string // number, string, date

  /**
   * @deprecated use semantics
   */
  semantic?: Semantics
  /**
   * @deprecated use semantics
   */
  formatter?: string
  
  semantics?: {
    semantic?: Semantics
    formatter?: string
  }

  /**
   * @deprecated use caption
   */
  text?: string | EntityProperty
  unit?: string | EntityProperty
  
}