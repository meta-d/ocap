import { ChartAnnotation, EntityType, QueryReturn } from '@metad/ocap-core'
import { use } from "echarts/core"
import { cartesian3d } from './cartesian3d'
import { Line3DChart } from 'echarts-gl/charts'
import { Grid3DComponent } from 'echarts-gl/components'

use([Grid3DComponent, Line3DChart])

export function line3d(data: QueryReturn<unknown>, chartAnnotation: ChartAnnotation, entityType: EntityType) {
  return cartesian3d(data, chartAnnotation, entityType, null, null, 'line3D')
}
