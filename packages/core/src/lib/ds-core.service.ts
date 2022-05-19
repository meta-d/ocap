import { ComponentStore } from '@metad/store'
import { filter, map, Observable, shareReplay, switchMap } from 'rxjs'
import { Agent, AgentType, DSCacheService } from './agent'
import { DataSource, DataSourceFactory, DataSourceOptions } from './data-source'
import { EntitySet } from './models'

export interface DSState {
  dataSources: DataSourceOptions[]
}

export class DSCoreService extends ComponentStore<DSState> {

  private _dataSources = new Map<string, Observable<DataSource>>()
  constructor(
    public agents: Array<Agent>,
    dataSources: Array<DataSourceOptions>,
    public factories: Array<{ type: string; factory: DataSourceFactory }>,
    public cacheService: DSCacheService
  ) {
    super({ dataSources })
  }

  public readonly registerModel = this.updater((state, model: DataSourceOptions) => {
    console.log(`DSCoreService registerModel:`, model)

    // Backward compatibility
    if (model.useLocalAgent) {
      model.agentType = model.agentType ?? AgentType.Local
    }

    state.dataSources = state.dataSources ?? []
    const index = state.dataSources.findIndex((item) => item.name === model.name)
    if (index > -1) {
      state.dataSources.splice(index, 1, model)
    } else {
      state.dataSources.push(model)
    }
  })

  /**
   * @todo 共用 DataSource 对象
   * 
   * @param name 
   * @returns 
   */
  getDataSource(name: string): Observable<DataSource> {
    if (!this._dataSources.get(name)) {
      this._dataSources.set(name, this.select((state) => state.dataSources?.find((item) => item.name === name)).pipe(
        filter((value) => !!value),
        switchMap(async (options) => {
          const provider = this.factories.find(({ type }) => type === options?.type)
          if (!provider) {
            throw new Error(`Can't found provider for dataSource type: '${options.type}'`)
          }
          
          const agent = this.agents.find((item) => item.type === options.agentType)
  
          if (!agent) {
            throw new Error(`Can't found Agent for type '${options.agentType}'`)
          }
  
          const DataSourceType = await provider.factory()
          return new DataSourceType(options, agent, this.cacheService)
        }),
        shareReplay()
      ))
    }
    
    return this._dataSources.get(name)
  }

  getEntityService(dataSource: string, entitySet: string) {
    return this.getDataSource(dataSource).pipe(map((dataSource) => dataSource.createEntityService(entitySet)))
  }

  getEntitySet(dataSource: string, entity: string): Observable<EntitySet> {
    return this.getDataSource(dataSource).pipe(switchMap((dataSource) => dataSource.selectEntitySet(entity)))
  }
}
