import {
  AbstractDataSource,
  Catalog,
  DataSourceOptions,
  EntityService,
  EntitySet,
  EntityType,
  IDimensionMember
} from '@metad/ocap-core'
import { Observable } from 'rxjs'
import { ODataEntityService } from './entity.service'


export class ODataDataSource extends AbstractDataSource<DataSourceOptions> {
  
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
  getMembers(entity: string, dimension: string): Observable<IDimensionMember[]> {
    throw new Error('Method not implemented.')
  }
  createEntity(name: any, columns: any, data?: any): Observable<string> {
    throw new Error('Method not implemented.')
  }
  query({ statement: string }: { statement: any }): Observable<any> {
    throw new Error('Method not implemented.')
  }
}
