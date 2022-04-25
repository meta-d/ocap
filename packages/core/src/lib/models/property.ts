import { BaseProperty } from "../types"

export enum AggregationRole {
  dimension = 'dimension',
  hierarchy = 'hierarchy',
  level = 'level',
  measure = 'measure',
  text = 'text'
}

export interface EntityProperty extends Partial<BaseProperty> {
  __id__?: string
  name: string
  uniqueName?: string
  label?: string
  description?: string
  dataType?: string // number, string, date
  role?: AggregationRole
  hidden?: boolean
}