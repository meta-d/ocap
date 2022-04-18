import { ChartAnnotation, EntityType, QueryReturn } from '@metad/ocap-core'
import { cartesian } from './cartesian'

export function bar(data: QueryReturn<unknown>, chartAnnotation: ChartAnnotation, entityType: EntityType) {
  return cartesian(data, chartAnnotation, entityType, null, null, 'bar')
}
