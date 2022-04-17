import { ComponentStore } from '@metad/store'
import { map, Observable } from 'rxjs'
import { QueryReturn } from './annotations'
import { EntityType } from './csdl/entity'
import { DataSource, DataSourceOptions } from './data-source'
import { QueryOptions } from './types'

export const DATA_SOURCE_PROVIDERS = {}

// export interface DataSourceOptions {
//   name: string
//   type: string
// }

export interface DSState {
  dataSources: {
    [key: string]: DataSourceOptions
  }
}

export class DSCoreService extends ComponentStore<DSState> {
  constructor(dataSources: { [key: string]: DataSourceOptions }) {
    super({ dataSources })
  }

  getDataSource(name: string): Observable<DataSource> {
    return this.select((state) => state.dataSources[name]).pipe(
      map((options) => {
        const provider = DATA_SOURCE_PROVIDERS[options.type]
        if (!provider) {
          throw new Error(`Can't found provider for dataSource type: '${options.type}'`)
        }

        return provider.factory(options)
      })
    )
  }

  getEntityService(dataSource: string, entitySet: string) {
    return this.getDataSource(dataSource).pipe(map(dataSource => dataSource.createEntityService(entitySet)))
  }
}

// export interface DataSource {
//   options: DataSourceOptions

//   createEntityService<T>(entitySet: string): EntityService<T>

//   selectEntityType(entity: string): Observable<EntityType>
// }

export interface EntityService<T> {
  dataSource: DataSource
  entitySet: string

  /**
   * 获取 EntityType
   */
  selectEntityType(): Observable<EntityType>

  query(options?: QueryOptions): Observable<QueryReturn<T>>

  refresh(): void

  onDestroy(): void
}
