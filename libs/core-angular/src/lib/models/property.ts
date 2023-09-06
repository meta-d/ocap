import { SortDirection } from './sort-prop-dir'

/**
 * 脱离于 ds-core 的 Property 类型定义， 有必要吗？
 */
// export interface NxProperty {
//   name: string
//   label?: string
//   property?: string
//   description?: string
//   sortDir?: SortDirection
//   aggregationRole?: NxAggregationRole
//   text?: NxProperty
//   unit?: NxProperty
//   semantics?: NxSemantics
// }

// export enum NxAggregationRole {
//   dimension = 'dimension',
//   measure = 'measure',
// }

export enum NxSemantics {
  currencyCode = 'currency-code',
  unitOfMeasure = 'unit-of-measure',
}
