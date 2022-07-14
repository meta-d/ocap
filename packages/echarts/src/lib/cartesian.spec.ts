import { getCoordinateSystem, measuresToSeriesComponents } from './cartesian'
import { CHART_ANNOTATION, SALES_ENTITY_TYPE } from './mock'

describe('CoordinateSystem', () => {
  it('#Basic', () => {
    const c = getCoordinateSystem(CHART_ANNOTATION, SALES_ENTITY_TYPE, [], {}, 'zh-Hans')

    expect(c).toMatchObject({
      valueAxis: { axis: [undefined], orient: 'yAxis' }
    })
    expect(c.categoryAxis).toMatchObject({
      orient: 'xAxis'
    })
  })

  it('#measuresToSeriesComponents', () => {
    const seriesComponents = measuresToSeriesComponents(CHART_ANNOTATION.measures, [], SALES_ENTITY_TYPE, {})

    expect(seriesComponents[0]).toEqual(
      expect.objectContaining({
        id: 'sales',
        measure: 'sales',
        valueAxisIndex: 0,
      })
    )
  })
})
