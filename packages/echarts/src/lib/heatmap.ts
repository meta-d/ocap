import { ChartAnnotation, EntityType, QueryReturn } from '@metad/ocap-core'
import { HeatmapChart } from 'echarts/charts'
import { use } from 'echarts/core'
import { cartesian } from './cartesian'

use([HeatmapChart])

export function heatmap(data: QueryReturn<unknown>, chartAnnotation: ChartAnnotation, entityType: EntityType) {
  return cartesian(data, chartAnnotation, entityType, null, null, 'heatmap')
}
