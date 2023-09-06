import { skip } from 'rxjs'
import { AgentType, MockAgent } from '../agent'
import { DSCoreService } from '../ds-core.service'
import { C_MEASURES } from '../types'
import { ChartBusinessService } from './chart.service'
import { MockDataSource } from '../mock'
import { SmartFilterBarService } from './smart-filter-bar.service'

describe('ChartBusinessService', () => {
  let service: ChartBusinessService<unknown>
  let filterBar: SmartFilterBarService
  const dataSettings = {
    dataSource: 'Mock',
    entitySet: 'SalesOrder',
    chartAnnotation: {
      chartType: {
        type: 'Bar'
      },
      dimensions: [
        {
          dimension: 'Department'
        }
      ],
      measures: [
        {
          dimension: C_MEASURES,
          measure: 'sales'
        }
      ]
    }
  }
  const aSlicer = {
    dimension: {
      dimension: 'Department'
    },
    members: [
      {
        value: 'A'
      }
    ]
  }

  beforeEach(() => {
    filterBar = new SmartFilterBarService()
    service = new ChartBusinessService(
      new DSCoreService(
        [new MockAgent()],
        [
          {
            type: 'SQL',
            name: 'Mock',
            agentType: AgentType.Browser
          }
        ],
        [
          {
            type: 'SQL',
            factory: async () => {
              return MockDataSource
            }
          }
        ]
      ),
      filterBar
    )
  })

  afterEach(() => {
    service.onDestroy()
  })

  it('#should be created', (done) => {
    service.dataSettings = dataSettings

    service.selectResult().pipe(skip(1)).subscribe((result: any) => {
      expect(result.options.filters).toEqual([aSlicer])
      done()
    })

    service.refresh()

    setTimeout(() => {
      filterBar.change([aSlicer])
      filterBar.go()
    }, 500)
  })

  it('#SmartFilter to result', (done) => {
    service.dataSettings = dataSettings

    service.refresh()
    service.refresh()
    service
      .selectResult()
      .pipe(skip(1))
      .subscribe((result: any) => {
        expect(result.options.filters).toEqual([aSlicer])
        done()
      })

    setTimeout(() => {
      filterBar.change([aSlicer])
      filterBar.go()
    }, 500)
  })
})
