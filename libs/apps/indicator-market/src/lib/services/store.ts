import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { Injectable, computed, inject, signal } from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import {
  BusinessAreasService,
  IndicatorAppService,
  IndicatorsService,
  ModelsService,
  convertIndicatorResult,
  convertNewSemanticModelResult
} from '@metad/cloud/state'
import { nonNullable } from '@metad/core'
import { IBusinessAreaUser, IComment, IIndicatorApp, ISemanticModel } from '@metad/contracts'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { ComponentStore } from '@metad/store'
import { StoryModel, convertStoryModel2DataSource } from '@metad/story/core'
import { EntityAdapter, EntityState, Update, createEntityAdapter } from '@ngrx/entity'
import { assign, includes, indexOf, isEmpty, isEqual, sortBy, uniq } from 'lodash-es'
import { Observable, Subject, combineLatest, firstValueFrom } from 'rxjs'
import { concatMap, debounceTime, distinctUntilChanged, map, shareReplay, switchMap, tap } from 'rxjs/operators'
import { IndicatorState, TagEnum } from '../types'

type DataSources = {
  [id: string]: {
    name: string
    semanticModel: ISemanticModel
  }
}

export interface IndicatorStoreState extends EntityState<IndicatorState> {
  // currentIndicator?: string
  dataSources: DataSources
  currentPage: number
  tag: TagEnum
  search?: string
  lookBack?: number
  locale?: string

  businessAreas: Record<string, IBusinessAreaUser>
  app: IIndicatorApp
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
  businessAreas: {},
  app: null
})
const { selectAll } = adapter.getSelectors()

@Injectable()
export class IndicatorsStore extends ComponentStore<IndicatorStoreState> {
  readonly #iAppService = inject(IndicatorAppService)

  private pageSize = 10

  get dataSources() {
    return this.get((state) => state.dataSources)
  }

  get locale() {
    return this.get((state) => state.locale)
  }
  set locale(value) {
    this.patchState({ locale: value })
  }

  private refresh$ = new Subject<boolean>()

  // TODO distinctUntilChanged 需要找到原因
  public readonly all$: Observable<IndicatorState[]> = this.select(selectAll).pipe(distinctUntilChanged(isEqual))

  /**
  |--------------------------------------------------------------------------
  | Signals
  |--------------------------------------------------------------------------
  */
  readonly currentIndicator = signal<string | null>(null)
  readonly favorites = toSignal(this.select((state) => state.app?.options?.favorites))
  readonly sortedIndicators$ = toSignal(combineLatest([this.all$, this.select((state) => state.app?.options ?? {})]).pipe(
    map(([indicators, { favorites, order }]) => {
      const favIndicators = (favorites ?? []).map((id) => {
        const indicator = indicators.find((item) => item.id === id)
        return indicator ? {
          ...indicator,
          favour: true,
        } : null
      }).filter(nonNullable)
      const subIndicators = indicators.filter((item) => !favorites?.includes(item.id))

      if (order) {
        return [
          ...sortBy(favIndicators, (obj) => indexOf(order, obj.id)),
          ...sortBy(subIndicators, (obj) => indexOf(order, obj.id))
        ]
      }

      return [...favIndicators, ...subIndicators]
    })
  ))

  readonly firstIndicator = computed(() => this.sortedIndicators$()[0] ?? null)

  /**
  |--------------------------------------------------------------------------
  | Observables
  |--------------------------------------------------------------------------
  */
  public readonly indicators$ = this.select(
    combineLatest([toObservable(this.sortedIndicators$), this.select((state) => state.search).pipe(debounceTime(200))]).pipe(
      map(([indicators, text]) => {
        if (text) {
          return indicators.filter(
            (indicator) => includes(indicator.name.toLowerCase(), text) || includes(indicator.code.toLowerCase(), text)
          )
        }
        return indicators
      })
    ),
    this.select((state) => state.currentPage),
    (indicators, page) => {
      return indicators.slice(0, page * this.pageSize)
    }
  ).pipe(shareReplay(1))

  // public readonly currentIndicatorId$ = this.select((state) => state.currentIndicator)
  readonly currentIndicator$ = combineLatest([toObservable(this.currentIndicator), this.all$]).pipe(
    map(([id, indicators]) => indicators.find((item) => item.id === id)),
    distinctUntilChanged()
  )

  public readonly tag$ = this.select((state) => state.tag)
  public readonly lookBack$ = this.select((state) => state.lookBack)

  constructor(
    private modelsService: ModelsService,
    private indicatorService: IndicatorsService,
    private businessAreaService: BusinessAreasService,
    private ngmDSCore: NgmDSCoreService
  ) {
    super(adapter.setAll([], initialState) as IndicatorStoreState)
  }

  /**
   * Fetch detailed information of all required semantic models at once.
   */
  readonly fetchSemanticModel = this.effect((models$: Observable<string[]>) => {
    return models$.pipe(
      switchMap((ids) =>
        combineLatest(
          ids.map((id) =>
            this.modelsService
              .getById(id, ['dataSource', 'dataSource.type', 'indicators'])
              .pipe(map(convertNewSemanticModelResult))
          )
        )
      ),
      tap((storyModels: StoryModel[]) => {
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

  init() {
    this.setState(adapter.setAll([], initialState))
  }

  /**
   * Get all indicators that the current user has permission to view data for.
   */
  fetchAll() {
    combineLatest([
      this.#iAppService.getMy().pipe(map((apps) => apps[apps.length - 1])),
      this.indicatorService.getApp(['comments'])
    ]).subscribe(([indicatorApp, indicators]) => {
      this.patchState({
        app: indicatorApp
      })

      const items = indicators?.filter((item) => item.modelId && item.entity).map(convertIndicatorResult)

      const models = uniq(items.map((item) => item.modelId)).filter((id) => !!id && !this.dataSources[id])
      if (!isEmpty(models)) {
        this.fetchSemanticModel(models)
      }

      this.setIndicators(items as IndicatorState[])
    })
  }

  isEmpty() {
    return this.get((state) => !state.ids.length)
  }

  async getBusinessAreaUser(id: string) {
    const user = this.get((state) => state.businessAreas)[id]
    if (!user) {
      const user = await firstValueFrom(this.businessAreaService.getMeInBusinessArea(id))
      this.updater((state, user: IBusinessAreaUser) => {
        state.businessAreas[id] = user
      })(user)
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
        comments: [...comments, comment]
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

  /**
   * Update the order of the indicators
   */
  updateOrders = this.updater((state, indicators: string[]) => {
    const app = state.app ?? {}
    state.app = {
      ...app,
      options: {
        ...(app.options ?? {}),
        order: indicators
      }
    }
  })

  /**
   * Drag and drop to reorder and save to the server
   */
  order = this.effect((event$: Observable<CdkDragDrop<IndicatorState[]>>) => {
    return event$.pipe(
      switchMap((event) => {
        const indicators = this.sortedIndicators$().map(({ id }) => id) as string[]
        moveItemInArray(indicators, event.previousIndex, event.currentIndex)
        this.updateOrders(indicators)
        const app = this.get((state) => state.app)
        return this.#iAppService.upsert({
          ...app
        })
      })
    )
  })

  private addFavorite = this.updater((state, id: string) => {
    const app = state.app ?? {}
    app.options = app.options ?? {}
    app.options.favorites = app.options.favorites ?? []

    if (!app.options.favorites?.includes(id)) {
      app.options.favorites.push(id)
    }
    state.app = {
      ...app
    }
  })

  private removeFavorite = this.updater((state, id: string) => {
    const app = state.app ?? {}
    app.options = app.options ?? {}
    app.options.favorites = app.options.favorites ?? []

    app.options.favorites = app.options.favorites.filter((_) => _ !== id)
    state.app = {
      ...app
    }
  })

  createFavorite = this.effect((origin$: Observable<IndicatorState>) => {
    return origin$.pipe(
      concatMap((indicator) => {
        this.addFavorite(indicator.id)
        const app = this.get((state) => state.app)
        return this.#iAppService.upsert({
          ...app
        })
      })
    )
  })

  deleteFavorite = this.effect((origin$: Observable<IndicatorState>) => {
    return origin$.pipe(
      concatMap((indicator) => {
        this.removeFavorite(indicator.id)
        const app = this.get((state) => state.app)
        return this.#iAppService.upsert({
          ...app
        })
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
}
