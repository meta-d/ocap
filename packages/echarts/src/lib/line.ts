import { ChartAnnotation, ChartOptions, ChartSettings, EntityType, QueryReturn } from '@metad/ocap-core'
import { cartesian } from './cartesian'

export function line(
  data: QueryReturn<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: ChartOptions
) {
  return cartesian(data, chartAnnotation, entityType, settings, options, 'line')
}
