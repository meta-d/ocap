import { AgentType, MockAgent } from '../agent'
import { DSCoreService } from '../ds-core.service'
import { SmartIndicatorDataService } from './indicator-data.service'
import { CUBE_SALES_ORDER, MockDataSource } from '../mock'
import { SmartFilterBarService } from './smart-filter-bar.service'
import { PeriodFunctions } from '../annotations'
import { TimeGranularity } from '../filter'

describe('SmartIndicatorDataService', () => {
  let service: SmartIndicatorDataService<unknown>
  let filterBar: SmartFilterBarService
  let dsCoreService: DSCoreService

  beforeEach(() => {
    filterBar = new SmartFilterBarService()
    dsCoreService = new DSCoreService(
      [new MockAgent()],
      [
        {
          name: 'Sales',
          type: 'SQL',
          agentType: AgentType.Browser,
          settings: {
            ignoreUnknownProperty: true
          },
          schema: {
            name: 'Sales',
            cubes: [
              CUBE_SALES_ORDER
            ],
            indicators: [
              {
                id: '123456',
                code: 'I1',
                name: '指标',
                entity: CUBE_SALES_ORDER.name,
                measure: 'Sales'
              }
            ]
          }
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
    )
    service = new SmartIndicatorDataService<unknown>(
      dsCoreService,
      filterBar
    )
  })

  afterEach(() => {
    service.onDestroy()
  })

  it('#should be created', () => {
    expect(service).toBeTruthy()
  })

  it('#should go', (done) => {
    dsCoreService.setTimeGranularity(TimeGranularity.Month)
    const indicator = {
      code: 'I1'
    }
    service.dataSettings = {
      dataSource: 'Sales',
      entitySet: CUBE_SALES_ORDER.name
    }

    service.onAfterServiceInit().subscribe(() => {
      service.refresh()
    })

    service.patchState({
      indicatorId: indicator.code,
      measures: [PeriodFunctions.CURRENT],
      lookBack: 24
    })

    service.selectResult().subscribe((value: any) => {
      expect(value.indicator).toBeDefined()
      done()
    })
    
  })
})
