import {
  AbstractDataSource,
  Catalog,
  DataSourceOptions,
  DBCatalog,
  DBTable,
  Dimension,
  EntityService,
  EntitySet,
  EntityType,
  IDimensionMember
} from '@metad/ocap-core'
import { Observable } from 'rxjs'
import { ODataEntityService } from './entity.service'


export class ODataDataSource extends AbstractDataSource<DataSourceOptions> {
  dropEntity(name: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  selectEntitySets(refresh?: boolean): Observable<EntitySet[]> {
    throw new Error('Method not implemented.')
  }
  selectMembers(entity: string, dimension: Dimension): Observable<IDimensionMember[]> {
    throw new Error('Method not implemented.')
  }
  discoverMDMembers(entity: string, dimension: Dimension): Observable<IDimensionMember[]> {
    throw new Error('Method not implemented.')
  }
  discoverDBCatalogs(): Observable<DBCatalog[]> {
    throw new Error('Method not implemented.')
  }
  discoverDBTables(): Observable<DBTable[]> {
    throw new Error('Method not implemented.')
  }
  discoverMDCubes(refresh?: boolean): Observable<EntitySet[]> {
    throw new Error('Method not implemented.')
  }
  
  createEntityService<T>(entity: string): EntityService<T> {
    return new ODataEntityService(this, entity)
  }

  getEntitySets(): Observable<EntitySet[]> {
    throw new Error('Method not implemented.')
  }
  
  getEntityType(entity: string): Observable<EntityType> {

    throw new Error('Method not implemented.')
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
