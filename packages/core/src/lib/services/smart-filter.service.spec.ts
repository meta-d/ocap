import { AgentType, MockAgent } from '../agent'
import { DSCoreService } from '../ds-core.service'
import { MockDataSource } from './mock'
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
        dimension: 'Department'
      }
    }

    service.selectResult().subscribe((result) => {
      expect(result.data).toEqual([])
      done()
    })

    service.refresh()
  })
  
  it('#Query with Slicers', (done) => {
    service.dataSettings = {
      dataSource: 'Mock',
      entitySet: 'SalesOrder'
    }
    service.options = {
      dimension: {
        dimension: 'Department'
      }
    }
    service.selectionVariant = {
      selectOptions: [
        aSlicer
      ]
    }

    service.selectResult().subscribe((result: any) => {
      console.log(result.options.filters)
      expect(result.options.filters).toEqual([aSlicer])
      done()
    })

    service.refresh()
  })
})


// describe('SmartFilter Cascading Effect', () => {
//   let dsCoreService: DSCoreService
//   let smartFilterBarService: SmartFilterBarService
//   let filterA: SmartFilterService
//   let filterB: SmartFilterService
//   let filterC: SmartFilterService

//   beforeEach(() => {
//     dsCoreService = new DSCoreService(
//       [new MockAgent()],
//       [
//         {
//           type: 'SQL',
//           name: 'Mock',
//           agentType: AgentType.Browser
//         }
//       ],
//       [
//         {
//           type: 'SQL',
//           factory: async () => {
//             return MockDataSource
//           }
//         }
//       ]
//     )
//     smartFilterBarService = new SmartFilterBarService()
//     filterA = new SmartFilterService(dsCoreService, smartFilterBarService)
//     filterB = new SmartFilterService(dsCoreService, smartFilterBarService)
//     filterC = new SmartFilterService(dsCoreService, smartFilterBarService)
//   })

//   afterEach(() => {
//     smartFilterBarService.onDestroy()
//     filterA.onDestroy()
//     filterB.onDestroy()
//     filterC.onDestroy()
//   })

//   it('#should be created', () => {
//     expect(filterA).toBeTruthy()
//     expect(filterB).toBeTruthy()
//     expect(filterC).toBeTruthy()
//   })

//   it('#Should Query', (done) => {
//     filterA.dataSettings = {
//       dataSource: 'Mock',
//       entitySet: 'SalesOrder'
//     }
//     filterA.options = {
//       dimension: {
//         dimension: 'Department'
//       }
//     }

//     filterB.dataSettings = {
//       dataSource: 'Mock',
//       entitySet: 'SalesOrder'
//     }
//     filterB.options = {
//       dimension: {
//         dimension: 'Employee'
//       },
//       cascadingEffect: true
//     }

//     filterB.selectResult().subscribe((result) => {
//       expect(result.data).toEqual([])
//       done()
//     })

//     filterB.refresh()
//   })
  
// })