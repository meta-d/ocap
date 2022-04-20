import { ChartAnnotation, EntityType, QueryReturn } from '@metad/ocap-core'
import {
  BarChart
} from 'echarts/charts'
import { use } from "echarts/core"
import { cartesian } from './cartesian'

use([BarChart])

export function bar(data: QueryReturn<unknown>, chartAnnotation: ChartAnnotation, entityType: EntityType) {

  console.log(entityType)
  
  return cartesian(data, chartAnnotation, entityType, null, null, 'bar')
}
