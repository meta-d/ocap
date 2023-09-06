import { AgentType, MockAgent } from '../agent'
import { DSCoreService } from '../ds-core.service'
import { MockDataSource } from '../mock'
import { SmartFilterService } from './smart-filter.service'

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

describe('SmartFilterService', () => {
  let dsCoreService: DSCoreService
  // let smartFilterBarService: SmartFilterBarService
  let service: SmartFilterService

  beforeEach(() => {
    dsCoreService = new DSCoreService(
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
    )
    // smartFilterBarService = new SmartFilterBarService()
    service = new SmartFilterService(dsCoreService)
  })

  afterEach(() => {
    service.onDestroy()
  })

  it('#should be created', () => {
    expect(service).toBeTruthy()
  })

  it('#Should Query', (done) => {
    service.dataSettings = {
      dataSource: 'Mock',
      entitySet: 'SalesOrder'
    }
    service.options = {
      dimension: {
        dimension: '[Department]',
        hierarchy: '[Department]',
        memberCaption: '[Department].[DepDesc]'
      }
    }

    service.selectResult().subscribe((result) => {
      expect(result.data).toEqual([
        {
          memberKey: '[A]',
          dimension: '[Department]',
          hierarchy: '[Department]',
          memberCaption: 'A'
        }
      ])
      done()
    })

    service.refresh()
  })
  
  // it('#Query with Slicers', (done) => {
  //   service.dataSettings = {
  //     dataSource: 'Mock',
  //     entitySet: 'SalesOrder'
  //   }
  //   service.options = {
  //     dimension: {
  //       dimension: 'Department'
  //     }
  //   }
  //   service.selectionVariant = {
  //     selectOptions: [
  //       aSlicer
  //     ]
  //   }

  //   service.selectResult().subscribe((result: any) => {
  //     console.log(result.options.filters)
  //     expect(result.options.filters).toEqual([aSlicer])
  //     done()
  //   })

  //   service.refresh()
  // })
})
