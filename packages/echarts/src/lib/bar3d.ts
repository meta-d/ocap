import { ChartAnnotation, EntityType, QueryReturn } from '@metad/ocap-core'
import { Bar3DChart } from 'echarts-gl/charts'
import { Grid3DComponent } from 'echarts-gl/components'
import { use } from "echarts/core"
import { cartesian3d } from './cartesian3d'

use([Grid3DComponent, Bar3DChart])

export function bar3d(data: QueryReturn<unknown>, chartAnnotation: ChartAnnotation, entityType: EntityType) {
  return cartesian3d(data, chartAnnotation, entityType, null, null, 'bar3D')
}
