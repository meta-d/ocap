import { ChartAnnotation, EntityType, QueryReturn } from '@metad/ocap-core'
import { cartesian } from './cartesian'

export function scatter(data: QueryReturn<unknown>, chartAnnotation: ChartAnnotation, entityType: EntityType) {
  return cartesian(data, chartAnnotation, entityType, null, null, 'scatter')
}
