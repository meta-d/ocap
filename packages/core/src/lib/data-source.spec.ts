import { Observable, of } from 'rxjs'
import { DSCacheService, MockAgent } from './agent'
import { AbstractDataSource, DataSourceOptions } from './data-source'
import { EntityService } from './entity'
import { Catalog, EntitySet, EntityType, IDimensionMember } from './models'
import { Dimension } from './types'

class MockDataSource extends AbstractDataSource<DataSourceOptions> {
  createEntityService<T>(entity: string): EntityService<T> {
    throw new Error('Method not implemented.')
  }
  getEntitySets(): Observable<EntitySet[]> {
    throw new Error('Method not implemented.')
  }
  getEntityType(entity: string): Observable<EntityType> {
    return of(null)
  }
  getCatalogs(): Observable<Catalog[]> {
    throw new Error('Method not implemented.')
  }
  getMembers(entity: string, dimension: Dimension): Observable<IDimensionMember[]> {
    throw new Error('Method not implemented.')
  }
  createEntity(name: any, columns: any, data?: any): Observable<string> {
    throw new Error('Method not implemented.')
  }
  query({ statement: string }: { statement: any }): Observable<any> {
    throw new Error('Method not implemented.')
  }
}

describe('DataSource', () => {
  let dataSource: AbstractDataSource<DataSourceOptions>

  beforeAll(() => {
    dataSource = new MockDataSource({ type: 'SQL' }, new MockAgent(), new DSCacheService())
  })

  it('#selectEntitySet', (done) => {
    dataSource.selectEntitySet('SalesOrder').subscribe((entitySet) => {
      expect(entitySet).toEqual(null)

      done()
    })
  })
})
