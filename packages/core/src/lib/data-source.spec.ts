import { DSCacheService, MockAgent } from './agent'
import { AbstractDataSource, DataSourceOptions } from './data-source'
import { ENTITY_TYPE_SALESORDER, MockDataSource } from './mock'


describe('DataSource', () => {
  let dataSource: AbstractDataSource<DataSourceOptions>

  beforeAll(() => {
    dataSource = new MockDataSource({ type: 'SQL' }, new MockAgent(), new DSCacheService())
  })

  it('#selectEntitySet', (done) => {
    dataSource.selectEntitySet('SalesOrder').subscribe((entitySet) => {
      expect(entitySet).toEqual({
        caption: undefined,
        entityType: ENTITY_TYPE_SALESORDER,
        name: 'SalesOrder'
      })

      done()
    })
  })
})
