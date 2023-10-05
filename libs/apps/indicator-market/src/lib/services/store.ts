import { Injectable } from '@angular/core'
import { BusinessType, IBusinessAreaUser, IComment, IFavorite, ISemanticModel } from '@metad/contracts'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { ComponentStore } from '@metad/store'
import { createEntityAdapter, EntityAdapter, EntityState, Update } from '@ngrx/entity'
import {
  BusinessAreasService,
  convertIndicatorResult,
  convertNewSemanticModelResult,
  FavoritesService,
  IndicatorsService,
  ModelsService
} from '@metad/cloud/state'
import { convertStoryModel2DataSource, StoryModel } from '@metad/story/core'
import { assign, includes, isEmpty, isEqual, sortBy, uniq } from 'lodash-es'
import { combineLatest, firstValueFrom, Observable, Subject } from 'rxjs'
import { concatMap, debounceTime, distinctUntilChanged, map, shareReplay, switchMap, tap } from 'rxjs/operators'
import { IndicatorState, TagEnum } from '../types'


type DataSources = {
  [id: string]: {
    name: string
    semanticModel: ISemanticModel
  }
}

export interface IndicatorStoreState extends EntityState<IndicatorState> {
  currentIndicator?: string
  dataSources: DataSources
  currentPage: number
  tag: TagEnum
  search?: string
  lookBack?: number
  locale?: string

  businessAreas: Record<string, IBusinessAreaUser>
}

export function selectIndicatorId(a: IndicatorState): string {
  //In this case this would be optional since primary key is id
  return a.id
}

export function sortByName(a: IndicatorState, b: IndicatorState): number {
  return a.code.localeCompare(b.code)
}

export const adapter: EntityAdapter<IndicatorState> = createEntityAdapter<IndicatorState>({
  selectId: selectIndicatorId,
  sortComparer: sortByName
})

export const initialState: IndicatorStoreState = adapter.getInitialState({
  dataSources: {},
  currentPage: 1,
  tag: TagEnum.UNIT,
  businessAreas: {}
})
const { selectAll, selectEntities } = adapter.getSelectors()

@Injectable()
export class IndicatorsStore extends ComponentStore<IndicatorStoreState> {
  private pageSize = 10

  get dataSources() {
    return this.get((state) => state.dataSources)
  }

  get locale() {
    return this.get((state) => state.locale)
  }
  set locale(value) {
    this.patchState({locale: value})
  }

  private refresh$ = new Subject<boolean>()

  // TODO distinctUntilChanged 需要找到原因
  public readonly all$: Observable<IndicatorState[]> = this.select(selectAll).pipe(distinctUntilChanged(isEqual))

  public readonly indicators$ = this.select(
    combineLatest([
      this.all$.pipe(map((indicators) => sortBy(indicators, 'favour'))),
      this.select((state) => state.search).pipe(debounceTime(200))
    ]).pipe(
      map(([indicators, text]) => {
        if (text) {
          return indicators.filter((indicator) => includes(indicator.name.toLowerCase(), text) || includes(indicator.code.toLowerCase(), text))
        }
        return indicators
      })
    ),
    this.select((state) => state.currentPage),
    (indicators, page) => {
      return indicators.slice(0, page * this.pageSize)
    }
  ).pipe(shareReplay(1))

  public readonly currentIndicatorId$ = this.select((state) => state.currentIndicator)
  public readonly currentIndicator$ = combineLatest([this.currentIndicatorId$, this.all$]).pipe(
    map(([id, indicators]) => indicators.find((item) => item.id === id)),
    distinctUntilChanged()
  )

  public readonly tag$ = this.select((state) => state.tag)
  public readonly lookBack$ = this.select((state) => state.lookBack)

  constructor(
    private modelsService: ModelsService,
    private indicatorService: IndicatorsService,
    private businessAreaService: BusinessAreasService,
    private favoriteService: FavoritesService,
    private ngmDSCore: NgmDSCoreService
  ) {
    super(adapter.setAll([], initialState) as IndicatorStoreState)
  }

  readonly fetchSemanticModel = this.effect((models$: Observable<string[]>) => {
    return models$.pipe(
      switchMap((ids) => {
        return combineLatest(
          ids.map((id) => this.modelsService.getById(id, ['dataSource', 'dataSource.type', 'indicators']).pipe(map(convertNewSemanticModelResult)))
        )
      }),
      tap((storyModels: StoryModel[]) => {
        // console.log(`涉及到的语义模型:`, storyModels)
        const dataSources = {}
        storyModels.forEach((storyModel) => {
          const dataSource = convertStoryModel2DataSource(storyModel)
          this.ngmDSCore.registerModel(dataSource)

          dataSources[storyModel.id] = {
            modelId: storyModel.id,
            name: dataSource.name,
            semanticModel: storyModel
          }
        })

        this.updateDataSources(dataSources)
      })
    )
  })

  readonly updateDataSources = this.updater((state, dataSources: DataSources) => {
    const updates = state.ids
      .map((id) => state.entities[id])
      .filter((indicator) => !indicator.dataSettings && dataSources[indicator.modelId])
      .map((indicator) => ({
        id: indicator.id,
        changes: {
          dataSettings: {
            dataSource: dataSources[indicator.modelId].name,
            entitySet: indicator.entity
          }
        }
      }))

    assign(state, adapter.updateMany(updates, state))
    state.dataSources = {
      ...state.dataSources,
      ...dataSources
    }
  })

  readonly setIndicators = this.updater((state, indicators: IndicatorState[]) => {
    assign(state, adapter.setAll(indicators, state))
  })

  readonly updateIndicators = this.updater((state, indicators: Array<Update<IndicatorState>>) => {
    assign(state, adapter.updateMany(indicators, state))
  })

  readonly fetchPage = this.updater((state, page: number) => {
    if (page > state.currentPage) {
      state.currentPage = page
    }
  })

  readonly updateIndicator = this.updater((state, update: Update<IndicatorState>) => {
    assign(state, adapter.updateOne(update, state))
  })

  readonly resetData = this.updater((state) => {
    state.ids.forEach((id) => {
      state.entities[id].initialized = false
    })
  })

  readonly search = this.updater((state, text: string) => {
    state.search = text
  })

  readonly createFavorite = this.effect((origin$: Observable<IndicatorState>) => {
    return origin$.pipe(
      concatMap((indicator) => {
        return this.favoriteService
          .create({
            type: BusinessType.INDICATOR,
            indicatorId: indicator.id
          })
          .pipe(
            tap((result: IFavorite) => {
              this.updateIndicator({
                id: indicator.id,
                changes: {
                  favour: true,
                  favoriteId: result.id
                }
              })
            })
          )
      })
    )
  })

  readonly deleteFavorite = this.effect((origin$: Observable<IndicatorState>) => {
    return origin$.pipe(
      concatMap((indicator) => {
        return this.favoriteService.delete(indicator.favoriteId).pipe(
          tap((result) => {
            this.updateIndicator({
              id: indicator.id,
              changes: {
                favour: false,
                favoriteId: null
              }
            })
          })
        )
      })
    )
  })

  readonly toggleTag = this.updater((state) => {
    if (TagEnum[state.tag + 1]) {
      state.tag = state.tag + 1
    } else {
      state.tag = 0
    }
  })

  init() {
    this.setState(adapter.setAll([], initialState))
  }

  /**
   * 获取当前用户所有有权限查看数据的指标
   */
  async fetchAll() {
    const indicators = await firstValueFrom(this.indicatorService.getApp(['comments']))
    const items = indicators?.filter((item) => item.modelId && item.entity).map(convertIndicatorResult)

    const ids = uniq(items.map((item) => item.modelId)).filter((id) => !!id && !this.dataSources[id])
    if (!isEmpty(ids)) {
      this.fetchSemanticModel(ids)
    }

    this.setIndicators(items as IndicatorState[])

    const favorites = await firstValueFrom(this.favoriteService.getByType(BusinessType.INDICATOR))
    this.updateIndicators(
      favorites.map((item) => ({
        id: item.indicatorId,
        changes: {
          favour: true,
          favoriteId: item.id
        }
      }))
    )
  }

  isEmpty() {
    return this.get((state) => !state.ids.length)
  }

  async getBusinessAreaUser(id: string) {
    const user = this.get((state) => state.businessAreas)[id]
    if (!user) {
      const user = await firstValueFrom(this.businessAreaService.getMeInBusinessArea(id));
      (this.updater((state, user: IBusinessAreaUser) => {
        state.businessAreas[id] = user
      }))(user)
    }

    return this.get((state) => state.businessAreas)[id]
  }

  selectIndicator(id: string) {
    return this.select((state) => state.entities[id])
  }

  addComment(comment: IComment) {
    const comments = this.get((state) => state.entities[comment.indicatorId]?.comments)
    this.updateIndicator({
      id: comment.indicatorId,
      changes: {
        comments: [
          ...comments,
          comment
        ]
      }
    })
  }

  removeComment(comment: IComment) {
    const comments = this.get((state) => state.entities[comment.indicatorId]?.comments)
    this.updateIndicator({
      id: comment.indicatorId,
      changes: {
        comments: comments.filter((item) => item.id !== comment.id)
      }
    })
  }

  onRefresh() {
    return this.refresh$.asObservable()
  }

  refresh(force = false) {
    this.refresh$.next(force)
  }
}
