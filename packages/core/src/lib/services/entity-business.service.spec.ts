import { AgentType, MockAgent } from '../agent'
import { DSCoreService } from '../ds-core.service'
import { EntityBusinessService } from './entity-business.service'
import { MockDataSource } from '../mock'

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

describe('EntityBusinessService', () => {
  let dsCoreService: DSCoreService
  let service: EntityBusinessService<undefined>

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
    service = new EntityBusinessService(dsCoreService)
  })

  afterEach(() => {
    service.onDestroy()
  })

  it('#should be created', () => {
    expect(service).toBeTruthy()
  })

  it('#should be created', () => {
    service.selectionVariant = {
      selectOptions: [aSlicer]
    }
    service.dataSettings = {
      dataSource: 'Mock',
      entitySet: 'SalesOrder'
    }

    expect(service.selectionVariant).toEqual({
      selectOptions: [aSlicer]
    })
  })
})
