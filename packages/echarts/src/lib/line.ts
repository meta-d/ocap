import { ChartAnnotation, ChartSettings, EntityType, QueryReturn } from '@metad/ocap-core'
import { cartesian } from './cartesian'
import { EChartsOptions } from './types'

export function line(
  data: QueryReturn<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: EChartsOptions
) {
  return cartesian(data, chartAnnotation, entityType, settings, options, 'line')
}
