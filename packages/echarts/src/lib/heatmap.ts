import { ChartAnnotation, ChartOptions, ChartSettings, EntityType, QueryReturn } from '@metad/ocap-core'
import { HeatmapChart } from 'echarts/charts'
import { use } from 'echarts/core'
import { cartesian } from './cartesian'

use([HeatmapChart])

export function heatmap(
  data: QueryReturn<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: ChartOptions
) {
  return cartesian(data, chartAnnotation, entityType, settings, options, 'heatmap')
}
