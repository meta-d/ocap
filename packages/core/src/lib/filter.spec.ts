import { Semantics } from './annotations'
import { putFilter, TimeGranularity, TimeRangesSlicer, TimeRangeType, workOutTimeRangeSlicers } from './filter'
import { AggregationRole, EntityType } from './models/index'

const entityType: EntityType = {
  name: 'Sales',
  properties: {
    Time: {
      name: 'Time',
      role: AggregationRole.dimension,
      semantics: {
        semantic: Semantics.Calendar
      }
    }
  }
}

describe('TimeRangeSlicers', () => {
  it('#WorkOutTimeRangeSlicers Basic', () => {
    const timeRange: TimeRangesSlicer = null

    expect(
      workOutTimeRangeSlicers(
        new Date('2022-05-01'),
        {
          dimension: {
            dimension: 'Time'
          },
          currentDate: new Date().toString(),
          ranges: [
            {
              type: TimeRangeType.Standard,
              granularity: TimeGranularity.Month
            }
          ]
        },
        entityType
      )
    ).toEqual([{ dimension: { dimension: 'Time' }, members: [{ value: '202205' }] }])
  })

  it('#WorkOutTimeRangeSlicers with Formatter', () => {
    const timeRange: TimeRangesSlicer = null

    expect(
      workOutTimeRangeSlicers(
        new Date('2022-05-01'),
        {
          dimension: {
            dimension: 'Time'
          },
          currentDate: new Date().toString(),
          ranges: [
            {
              type: TimeRangeType.Standard,
              granularity: TimeGranularity.Month,
              formatter: `yyyy.MM`
            }
          ]
        },
        entityType
      )
    ).toEqual([{ dimension: { dimension: 'Time' }, members: [{ value: '2022.05' }] }])
  })

  it('#WorkOutTimeRangeSlicers with Semantics', () => {
    const timeRange: TimeRangesSlicer = null

    expect(
      workOutTimeRangeSlicers(
        new Date('2022-05-01'),
        {
          dimension: {
            dimension: 'Time'
          },
          currentDate: new Date().toString(),
          ranges: [
            {
              type: TimeRangeType.Standard,
              granularity: TimeGranularity.Month
            }
          ]
        },
        {
          ...entityType,
          properties: {
            ...entityType.properties,
            Time: {
              ...entityType.properties['Time'],
              semantics: {
                semantic: Semantics.Calendar,
                formatter: ``
              },
              hierarchies: [
                {
                  name: '',
                  role: AggregationRole.hierarchy,
                  levels: [
                    {
                      name: 'Month',
                      role: AggregationRole.level,
                      semantics: {
                        semantic: Semantics['Calendar.Month'],
                        formatter: `[yyyy].[MM]`
                      }
                    }
                  ]
                }
              ]
            }
          }
        }
      )
    ).toEqual([{ dimension: { dimension: 'Time' }, members: [{ value: '[2022].[05]' }] }])
  })
})


describe('Slicers', () => {
  it('putFilter', () => {
    let filters = []
    filters = putFilter(filters, {dimension: {
      dimension: 'Department'
    }})

    expect(filters).toEqual([])
  })
  
})