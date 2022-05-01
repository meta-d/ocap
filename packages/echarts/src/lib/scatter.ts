import { ChartAnnotation, ChartSettings, EntityType, QueryReturn } from '@metad/ocap-core'
import { cartesian } from './cartesian'
import { EChartsOptions } from './types'

export function scatter(
  data: QueryReturn<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: EChartsOptions
) {
  return cartesian(data, chartAnnotation, entityType, settings, options, 'scatter')
}
