import { AggregationRole, C_MEASURES } from '@metad/ocap-core'
import { getCoordinateSystem } from './cartesian'

describe('CoordinateSystem', () => {
  it('#Basic', () => {
    const c = getCoordinateSystem(
      {
        chartType: {
          type: 'Scatter'
        },
        dimensions: [
          {
            dimension: 'Time'
          }
        ],
        measures: [
          {
            dimension: C_MEASURES,
            measure: 'sales'
          }
        ]
      },
      {
        name: 'Sales',
        properties: {
          Time: {
            name: 'Time',
            role: AggregationRole.dimension
          },
          sales: {
            name: 'sales',
            role: AggregationRole.measure
          }
        }
      },
      [],
      {},
      'zh-Hans'
    )

    expect(c).toMatchObject({
      valueAxis: { axis: [undefined], orient: 'yAxis' }
    })
    expect(c.categoryAxis).toMatchObject({
      orient: 'xAxis'
    })
  })
})
