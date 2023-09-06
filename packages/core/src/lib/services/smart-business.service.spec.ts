import { skip } from 'rxjs'
import { AgentType, MockAgent } from '../agent'
import { DSCoreService } from '../ds-core.service'
import { dataSettings, MockDataSource } from '../mock'
import { SmartBusinessService } from './smart-business.service'
import { SmartFilterBarService } from './smart-filter-bar.service'

describe('SmartBusinessService', () => {
  let service: SmartBusinessService<unknown>
  let filterBar: SmartFilterBarService

  beforeEach(() => {
    filterBar = new SmartFilterBarService()
    service = new SmartBusinessService<unknown>(
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

  it('#should be created', () => {
    expect(service).toBeTruthy()
  })

  it('#should no error', (done) => {
    service.dataSettings = {...dataSettings}
    service.selectResult().subscribe(({error}) => {
      expect(!error).toBeTruthy()
      done()
    })
    service.refresh()
  })

  it('#should go', (done) => {
    service.dataSettings = {
      ...dataSettings,
    }

    service.selectResult().pipe(skip(1)).subscribe(({error}) => {
      expect(!error).toBeTruthy()
      done()
    })
    service.refresh()

    setTimeout(() => {
      filterBar.go()
    }, 200)
  })
})
