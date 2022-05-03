import { ComponentStore } from '@metad/store'
import { filter, map, Observable } from 'rxjs'
import { Agent } from './agent'
import { QueryReturn } from './annotations'
import { EntityType } from './csdl/entity'
import { DataSource, DataSourceOptions, DATA_SOURCE_PROVIDERS } from './data-source'
import { QueryOptions } from './types'

export interface DSState {
  dataSources: DataSourceOptions[]
}

export class DSCoreService extends ComponentStore<DSState> {
  constructor(public agents: Array<Agent>, dataSources: Array<DataSourceOptions>) {
    super({ dataSources })
  }

  public readonly registerModel = this.updater((state, model: DataSourceOptions) => {
    const index = state.dataSources.findIndex((item) => item.name === model.name)
    if (index > -1) {
      state.dataSources.splice(index, 1, model)
    } else {
      state.dataSources.push(model)
    }
  })

  getDataSource(name: string): Observable<DataSource> {
    return this.select((state) => state.dataSources.find((item) => item.name === name)).pipe(
      filter((value) => !!value),
      map((options) => {
        const provider = DATA_SOURCE_PROVIDERS[options?.type]
        if (!provider) {
          throw new Error(`Can't found provider for dataSource type: '${options.type}'`)
        }

        const agent = options.agentType ? this.agents.find((item) => item.type === options.agentType) : this.agents[0]

        return provider.factory(options, agent)
      })
    )
  }

  getEntityService(dataSource: string, entitySet: string) {
    return this.getDataSource(dataSource).pipe(map((dataSource) => dataSource.createEntityService(entitySet)))
  }
}

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
