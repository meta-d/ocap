import {
  AbstractDataSource,
  AbstractEntityService,
  Catalog,
  DATA_SOURCE_PROVIDERS,
  EntityService,
  EntitySet,
  EntityType,
  IDimensionMember,
  QueryOptions,
  QueryReturn
} from '@metad/ocap-core'
import { randAirline, randFloat, randProductAdjective, randProductCategory } from '@ngneat/falso'
import { BehaviorSubject, debounceTime, Observable, of, switchMap } from 'rxjs'
import { SQLDataSourceOptions } from './types'

DATA_SOURCE_PROVIDERS['SQL'] = {
  factory: (options: SQLDataSourceOptions) => {
    return new SQLDataSource(options)
  }
}

export class SQLDataSource extends AbstractDataSource<SQLDataSourceOptions> {
  getEntitySets(): Observable<EntitySet[]> {
    throw new Error('Method not implemented.')
  }
  getEntityType(entitySet: any): Observable<EntityType> {
    return of({
      name: entitySet,
      properties: {}
    })
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
  createEntityService<T>(entitySet: string): EntityService<T> {
    return new SQLEntityService(this, entitySet)
  }
}

export class SQLEntityService<T> extends AbstractEntityService<T> {
  refresh$ = new BehaviorSubject<void>(null)

  override query(options?: QueryOptions): Observable<QueryReturn<T>> {
    return this.refresh$.pipe(
      debounceTime(3000),
      switchMap(() => {
        return of(
          this.entitySet === 'SalesOrder'
            ? {
                results: randProductAdjective({ length: 20 }).map((adjective) => ({
                  product: adjective,
                  productCategory: randProductCategory(),
                  sales: randFloat()
                }))
              }
            : {
                results: randAirline({ length: 10 }).map((airline) => ({
                  product: airline,
                  sales: randFloat()
                }))
              }
        ) as unknown as Observable<QueryReturn<T>>
      })
    )
  }

  override refresh() {
    this.refresh$.next()
  }
}

export default {}
