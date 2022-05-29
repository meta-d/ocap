import { ChartDataZoomType } from '@metad/ocap-core'
import { dataZoom } from './data-zoom'

describe('dataZoom', () => {
  it('#Basic', () => {
    expect(dataZoom({ dataZoom: { type: ChartDataZoomType.INSIDE } })).toEqual([{ type: 'inside' }])
  })
})
