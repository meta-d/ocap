import { ComponentStore } from '@metad/store'
import { combineLatest, filter, map, Observable, shareReplay, switchMap } from 'rxjs'
import { Agent, AgentType, DSCacheService } from './agent'
import { DataSource, DataSourceFactory, DataSourceOptions } from './data-source'
import { EntitySet, isEntitySet } from './models'
import { TimeGranularity } from './models/index'

export interface DSState {
  dataSources: DataSourceOptions[]
  today?: Date
  timeGranularity?: TimeGranularity
}

export class DSCoreService extends ComponentStore<DSState> {
  public readonly timeGranularity$ = this.select((state) => state.timeGranularity)
  public readonly currentTime$ = combineLatest([this.select((state) => state.today), this.timeGranularity$]).pipe(
    map(([today, timeGranularity]) => ({ today, timeGranularity }))
  )

  private _dataSources = new Map<string, Observable<DataSource>>()

  constructor(
    public agents: Array<Agent>,
    dataSources: Array<DataSourceOptions>,
    public factories: Array<{ type: string; factory: DataSourceFactory }>,
    public cacheService?: DSCacheService
  ) {
    super({ dataSources })
  }

  public readonly registerModel = this.updater((state, model: DataSourceOptions) => {
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
      this._dataSources.set(
        name,
        this.select((state) => state.dataSources?.find((item) => item.key === name || item.name === name)).pipe(
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
          shareReplay(1)
        )
      )
    }

    return this._dataSources.get(name)
  }

  getEntityService(dataSource: string, entitySet: string) {
    return this.getDataSource(dataSource).pipe(map((dataSource) => dataSource.createEntityService(entitySet)))
  }
  /**
   * @deprecated use `selectEntitySet`
   */
  getEntitySet(dataSource: string, entity: string): Observable<EntitySet> {
    return this.selectEntitySet(dataSource, entity)
  }
  selectEntitySet(dataSource: string, entity: string): Observable<EntitySet> {
    return this.getDataSource(dataSource).pipe(
      switchMap((dataSource) => dataSource.selectEntitySet(entity).pipe(filter(isEntitySet)))
    )
  }

  setTimeGranularity(timeGranularity: TimeGranularity) {
    this.patchState({ timeGranularity })
  }

  setToday(today: Date) {
    this.patchState({ today })
  }

  getToday() {
    return this.get((state) => ({ today: state.today, timeGranularity: state.timeGranularity }))
  }
}
