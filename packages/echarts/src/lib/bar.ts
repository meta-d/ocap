import { ChartAnnotation, ChartOptions, ChartSettings, EntityType, QueryReturn } from '@metad/ocap-core'
import { BarChart } from 'echarts/charts'
import { use } from 'echarts/core'
import { cartesian } from './cartesian'

use([BarChart])

export function bar(
  data: QueryReturn<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: ChartOptions
) {
  return cartesian(data, chartAnnotation, entityType, settings, options, 'bar')
}
