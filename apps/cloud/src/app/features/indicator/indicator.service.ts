import { Injectable } from '@angular/core'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { getEntityDimensions, isEntityType } from '@metad/ocap-core'
import { ComponentStore } from '@metad/store'
import { Indicator, IndicatorsService, ModelsService, NgmSemanticModel } from '@metad/cloud/state'
import { includes, isString } from 'lodash-es'
import { BehaviorSubject, EMPTY, combineLatest } from 'rxjs'
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators'
import { IIndicator, registerModel } from '../../@core/index'
import { nonBlank } from '@metad/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'

export interface IndicatorState {
  formModel: Indicator
  indicator: IIndicator
  dataSource: string
}

/**
 * 单一指标状态管理器
 */
@Injectable()
export class PACIndicatorService extends ComponentStore<IndicatorState> {
  public indicator$ = this.select((state) => state.indicator)
  public models$ = this.modelsService.getMy()

  public storyModel$ = this.select((state) => state.formModel?.modelId).pipe(
    filter(nonBlank),
    switchMap((id) => this.modelsService.getById(id, ['dataSource', 'dataSource.type', 'indicators']))
  )
  freeDimensions$ = this.select((state) => state.formModel?.dimensions)

  public dataSource$ = this.select((state) => state.dataSource).pipe(
    filter((dataSource) => !!dataSource),
    switchMap((name) => this.dsCoreService.getDataSource(name))
  )
  public entitySets$ = this.dataSource$.pipe(switchMap((dataSource) => dataSource.getEntitySets()))

  public dataSettings$ = this.select(
    this.select((state) => state.formModel?.entity).pipe(filter((entity) => !!entity)),
    this.dataSource$,
    (entitySet, dataSource) => {
      return {
        dataSource: dataSource.options.key,
        entitySet
      }
    }
  )

  public readonly entityTypeLoading$ = new BehaviorSubject<boolean>(null)

  public entityType$ = this.dataSettings$.pipe(
    switchMap(({ dataSource, entitySet }) => {
      this.entityTypeLoading$.next(true)
      return this.dsCoreService.getDataSource(dataSource).pipe(
        switchMap((dataSource) => dataSource.selectEntityType(entitySet)),
        catchError((error) => {
          console.error(error)
          this.entityTypeLoading$.next(false)
          return EMPTY
        }),
        tap((entityType) => {
          if (entityType instanceof Error) {
            console.error(entityType)
          }
          this.entityTypeLoading$.next(false)
        }),
        filter(isEntityType)
      )
    })
  )

  public filterDimensions$ = combineLatest([this.entityType$, this.freeDimensions$]).pipe(
    map(([entityType, freeDimensions]) =>
      getEntityDimensions(entityType).filter((item) => !includes(freeDimensions, item.name))
    )
  )

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effect)
  |--------------------------------------------------------------------------
  */
  private modelSub = this.storyModel$.pipe(takeUntilDestroyed()).subscribe((storyModel) => {
    // 指标公式编辑时需要用到现有 Indicators
    // const dataSource = registerModel(omit(storyModel, 'indicators'), this.dsCoreService, this.wasmAgent)
    const dataSource = registerModel(storyModel as NgmSemanticModel, this.dsCoreService, this.wasmAgent)
    this.setDataSource(dataSource.name)
  })
  constructor(
    private indicatorsService: IndicatorsService,
    private modelsService: ModelsService,
    private dsCoreService: NgmDSCoreService,
    private wasmAgent: WasmAgentService
  ) {
    super({} as IndicatorState)
  }

  setFormModel = this.updater((state, model: Indicator) => {
    state.formModel = model
    return state
  })

  setDataSource = this.updater((state, dataSource: string) => {
    state.dataSource = dataSource
    return state
  })

  createIndicator(indicator: Indicator) {
    return this.indicatorsService.create(indicator).pipe(
      tap((indicator) => {
        this.patchState({ indicator })
      })
    )
  }

  upload(indicators: Indicator[]) {
    return this.indicatorsService.createBulk(
      indicators.map((item: any) => ({
        ...item,
        // 向后兼容
        filters: isString(item.filters) && item.filters!! ? JSON.parse(item.filters) : item.filters,
        dimensions: isString(item.dimensions) && item.dimensions ? JSON.parse(item.dimensions) : item.dimensions
      }))
    )
  }
}
