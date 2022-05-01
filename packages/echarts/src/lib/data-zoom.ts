import { ChartDataZoomType } from '@metad/ocap-core'
import { EChartsOptions } from './types'

export function dataZoom(chartOptions: EChartsOptions) {
  const dataZoom = []
  if (chartOptions?.dataZoom) {
    // TODO: 还没区分 axis
    if (chartOptions.dataZoom.type?.includes(ChartDataZoomType.INSIDE)) {
      dataZoom.push({
        ...chartOptions.dataZoom,
        type: ChartDataZoomType.INSIDE
      })
    }
    if (chartOptions.dataZoom.type?.includes(ChartDataZoomType.SLIDER)) {
      dataZoom.push({
        ...chartOptions.dataZoom,
        type: ChartDataZoomType.SLIDER,
        bottom: 5
      })
      //   grid.bottom = Math.max(options.grid.bottom, 40)
    }
  }

  return dataZoom
}
