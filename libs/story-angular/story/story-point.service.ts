import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { Inject, Injectable, Optional } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ISlicer, isAdvancedFilter, nonNullable } from '@metad/ocap-core'
import { ComponentSubStore, DirtyCheckQuery } from '@metad/store'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { TranslateService } from '@ngx-translate/core'
import { isNotEmpty, isNotEqual } from '@metad/core'
import {
  ID,
  LinkedAnalysisEvent,
  LinkedInteractionApplyTo,
  NX_STORY_FEED,
  NX_STORY_STORE,
  NxStoryFeedService,
  NxStoryService,
  NxStoryStore,
  StoryEventType,
  StoryPoint,
  StoryPointState,
  StoryPointType,
  StoryState,
  StoryWidget,
  WIDGET_INIT_POSITION,
  uuid
} from '@metad/story/core'
import { FlexItemType, FlexLayout } from '@metad/story/responsive'
import { ISmartFilterBarOptions } from '@metad/story/widgets/filter-bar'
import { GridsterConfig } from 'angular-gridster2'
import { assign, cloneDeep, compact, isEmpty, isNil, merge, omit, sortBy } from 'lodash-es'
import { NGXLogger } from 'ngx-logger'
import { EMPTY, Observable, combineLatest, firstValueFrom, of } from 'rxjs'
import {
  catchError,
  combineLatestWith,
  distinctUntilChanged,
  filter,
  map,
  pluck,
  startWith,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators'

/**
 * 状态中 StoryPoint 与 Widgets 分开控制修改状态
 *
 */
@UntilDestroy({ checkProperties: true })
@Injectable()
export class NxStoryPointService extends ComponentSubStore<StoryPointState, StoryState> {
  get storyPoint() {
    return this.get((state) => state.storyPoint)
  }
  get widgets() {
    return this.get((state) => state.widgets)
  }

  public readonly linkedAnalysis$ = this.select((state) => state.linkedAnalysis)

  readonly storyPoint$ = this.select((state) => state.storyPoint)
  readonly active$ = this.select((state) => state.active)
  readonly fetched$ = this.select((state) => state.fetched)
  readonly widgets$ = this.select((state) => state?.widgets)
  public readonly isEmpty$ = this.widgets$.pipe(
    combineLatestWith(this.fetched$),
    map(([widgets, fetched]) => fetched && isEmpty(widgets))
  )
  readonly gridOptions$ = this.select((state) => state.storyPoint.gridOptions)
  public readonly allowMultiLayer$ = this.gridOptions$.pipe(
    map((gridOptions) => gridOptions?.allowMultiLayer),
    distinctUntilChanged()
  )
  readonly styling$ = this.select((state) => state.storyPoint?.styling)
  public filters$: Observable<Array<ISlicer>> = this.select((state) => state.storyPoint).pipe(
    filter(nonNullable),
    map(({filters}) => filters),
    distinctUntilChanged((x, y) => JSON.stringify(x) === JSON.stringify(y))
  )

  readonly currentWidget$ = this.select(
    this.widgets$,
    this.select((state) => state.currentWidgetKey),
    (widgets, key) => widgets?.find((item) => item.key === key)
  )

  readonly responsive$ = this.select((state) => (state.fetched ? state.storyPoint?.responsive : null))

  isDirty$ = this.select((state) => state.dirty)
  dirtyQuery: DirtyCheckQuery = new DirtyCheckQuery<StoryPointState>(this as any, {
    watchProperty: ['storyPoint'],
    clean: (head, current) => {
      return this._save(head.storyPoint, current.storyPoint)
    }
  })
  widgetsDirtyQuery: DirtyCheckQuery = new DirtyCheckQuery<StoryPointState>(this as any, {
    watchProperty: ['widgets'],
    clean: (head, current) => {
      return this._saveWidgets(head?.widgets, current.widgets)
    }
  })

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effect)
  |--------------------------------------------------------------------------
  */
  private currentWidgetSub = this.currentWidget$.subscribe((widget) => {
    this.storyService.setCurrentWidget(widget)
  })
  private isDirtySub = combineLatest([
    this.dirtyQuery.isDirty$.pipe(startWith(false)),
    this.widgetsDirtyQuery.isDirty$.pipe(startWith(false))
  ]).subscribe(([storyPoint, widgets]) => {
    this.logger?.debug(`[StoryPointService] isDirty = ${storyPoint} & ${widgets}`)
    this.patchState({ dirty: storyPoint || widgets })
  })
  // 监听故事的保存事件通知: 进行故事点和部件的保存
  private saveSub = this.storyService.save$
    .pipe(
      withLatestFrom(this.isDirty$),
      filter(([, dirty]) => dirty)
    )
    .subscribe(() => {
      this.save()
    })
  constructor(
    private storyService: NxStoryService,
    @Inject(NX_STORY_STORE)
    private readonly storyStore: NxStoryStore,
    @Optional()
    @Inject(NX_STORY_FEED)
    private feedService?: NxStoryFeedService,
    @Optional() private _snackBar?: MatSnackBar,
    @Optional() protected logger?: NGXLogger,
    @Optional() private translateService?: TranslateService
  ) {
    super({} as any)
  }

  readonly init = this.effect((key$: Observable<ID>) => {
    return key$.pipe(
      tap((key: ID) => this.connect(this.storyService, { parent: ['points', key as string], arrayKey: 'key' })),
      switchMap((key: ID) => {
        this.dirtyQuery.setHead()

        return this.storyService.selectPointEvent(key).pipe(
          tap((event) => {
            if (event.type === StoryEventType.CREATE_WIDGET) {
              this.createWidget(event.data)
            } else if (event.type === StoryEventType.PASTE_WIDGET) {
              this.pasteWidget(event.data)
            } else if (event.type === StoryEventType.SAVE) {
              this.save()
            } else if (event.type === StoryEventType.REMOVE_WIDGET) {
              this.removeWidget(event.data)
            }
          })
        )
      })
    )
  })

  async fetchStoryPoint() {
    const storyPoint = await firstValueFrom(this.storyPoint$)
    const point = await firstValueFrom(this.storyStore.getStoryPoint(storyPoint.storyId, storyPoint.id))
    this._setWidgets(point.widgets)
    this.patchState({ fetched: true })
    this.widgetsDirtyQuery.setHead()
  }

  async active(active: boolean) {
    this.patchState({ active })
    const fetched = await firstValueFrom(this.fetched$)
    if (active && !fetched) {
      await this.fetchStoryPoint()
    }

    this._applyPastedWidgets()
  }

  async save() {
    this.dirtyQuery.reset()
  }

  /**
   * 初始化 Widgets 状态
   */
  private readonly _setWidgets = this.updater((state, widgets: Array<StoryWidget>) => {
    state.widgets = state.widgets || []
    state.widgets.push(...widgets)
    // 对组件排序, 在移动端展示效果
    state.widgets = sortBy(state.widgets, 'index')
  })

  private readonly _applyPastedWidgets = this.updater((state) => {
    if (isNotEmpty(state.pasteWidgets)) {
      state.widgets.push(
        ...state.pasteWidgets.map((item) => ({
          ...item,
          // Apply this point id and story id
          storyId: this.storyPoint.storyId,
          pointId: this.storyPoint.id
        }))
      )
      state.pasteWidgets = []
    }
  })

  /**
   * 不同的组件发出相同维度的切片器如何覆盖 ？
   */
  readonly sendLinkedAnalysis = this.updater((state, event: LinkedAnalysisEvent) => {
    state.linkedAnalysis = state.linkedAnalysis ?? {}
    state.linkedAnalysis[event.originalWidget] = event
  })

  /**
   * Subscribe slicers from other widget by widget key
   *
   * @param widgetKey
   * @returns
   */
  selectLinkedAnalysis(widgetKey: string) {
    return this.linkedAnalysis$.pipe(
      filter(nonNullable),
      map((linkedAnalysis) => {
        const slicers = []
        const events = Object.values(linkedAnalysis).filter((event) => {
          return (
            !isEmpty(
              event.slicers?.filter((slicer) =>
                isAdvancedFilter(slicer) ? !isEmpty(slicer?.children) : !isEmpty(slicer?.members)
              )
            ) &&
            (isNil(event.linkedWidgets)
              ? event.originalWidget !== widgetKey
              : !!event.linkedWidgets?.find((key) => key === widgetKey))
          )
        })
        for (let i = events.length - 1; i >= 0; i--) {
          const event = events[i]
          event.slicers.forEach((slicer) => {
            if (!slicers.find((item) => item.dimension?.dimension === slicer.dimension?.dimension)) {
              slicers.push(slicer)
            }
          })
        }

        return slicers
      }),
      untilDestroyed(this)
    )
  }

  readonly updateGridOptions = this.updater((state, options: GridsterConfig) => {
    state.storyPoint.gridOptions = assign({}, state.storyPoint.gridOptions, options)
  })

  readonly updatePoint = this.updater((state, point: Partial<StoryPoint>) => {
    state.storyPoint = {
      ...state.storyPoint,
      ...point
    }
  })

  readonly setCurrentWidgetId = this.updater((state, key: ID) => {
    state.currentWidgetKey = key
  })
  readonly setCurrentFlexLayoutKey = this.updater((state, key: ID) => {
    state.currentFlexLayoutKey = key
  })

  // for widget actions
  readonly createWidget = this.updater((state, input: Partial<StoryWidget>) => {
    const untitledTitle = this.getTranslation('Story.Common.Untitled', 'Untitled')
    const widget = {
      ...input,
      key: uuid(),
      storyId: state.storyPoint.storyId,
      pointId: state.storyPoint.id,
      title: input.title || untitledTitle
    } as StoryWidget

    if (state.storyPoint.type === StoryPointType.Responsive) {
      if (state.currentFlexLayoutKey) {
        const flexLayout = findFlexLayout(state.storyPoint.responsive, state.currentFlexLayoutKey)
        flexLayout.children = flexLayout.children || []
        flexLayout.children.push({
          key: uuid(),
          type: FlexItemType.Widget,
          widgetKey: widget.key
        })
        state.widgets.push(widget)
      } else {
        throw new Error(`未选中区域`)
      }
    } else {
      widget.position = widget.position ?? { ...WIDGET_INIT_POSITION, x: 0, y: 0 }
      if (state.storyPoint.gridOptions?.allowMultiLayer) {
        widget.position.layerIndex = state.widgets.length
      }
      state.widgets.push(widget)
    }

    // Add new widget to linked analysis which connect newly
    state.widgets.forEach((item) => {
      if (item.linkedAnalysis?.interactionApplyTo === LinkedInteractionApplyTo.OnlySelectedWidgets && item.linkedAnalysis?.connectNewly) {
        item.linkedAnalysis.linkedWidgets = item.linkedAnalysis.linkedWidgets || []
        item.linkedAnalysis.linkedWidgets.push(widget.key)
      }
    })
  })

  readonly setWidget = this.updater((state, [index, widget]: [number, StoryWidget]) => {
    state.widgets[index] = widget
  })

  readonly updateWidget = this.updater((state, widget: Partial<StoryWidget>) => {
    const index = state.widgets.findIndex((item) => item.key === widget.key)
    if (index >= 0) {
      state.widgets[index] = {
        ...state.widgets[index],
        ...widget
      }
    }
  })

  /**
   * @deprecated hardcode for AnalyticalCard component
   */
  readonly updateWidgetChartOptions = this.updater((state, widget: Partial<StoryWidget>) => {
    const index = state.widgets.findIndex((item) => item.key === widget.key)
    if (index >= 0) {
      state.widgets[index] = {
        ...state.widgets[index],
        chartOptions: merge({}, (<any>state.widgets[index]).chartOptions, (<any>widget).chartOptions)
      } as StoryWidget
    }
  })

  readonly updateWidgetLayer = this.updater((state, widget: Partial<StoryWidget>) => {
    const index = state.widgets.findIndex((item) => item.key === widget.key)
    if (index >= 0) {
      state.widgets[index].position = {
        ...state.widgets[index].position,
        ...widget.position
      }
    }
  })

  readonly removeWidget = this.updater((state, key: ID) => {
    state.widgets = state.widgets.filter((item) => item.key !== key)
  })

  getTranslation(code: string, text: string, params?) {
    let result = text
    this.translateService?.get(code, { Default: text, ...(params ?? {}) }).subscribe((value) => {
      result = value
    })

    return result
  }

  readonly pasteWidget = this.updater((state, widget: StoryWidget) => {
    widget.key = uuid()
    widget.storyId = state.storyPoint.storyId
    widget.pointId = state.storyPoint.id
    const pasteWidgets = state.pasteWidgets || []
    if (isNil(state.widgets)) {
      pasteWidgets.push(widget)
      state.pasteWidgets = pasteWidgets
    } else {
      state.widgets.push(widget)
    }
  })

  readonly moveWidgetInArray = this.updater((state, event: CdkDragDrop<string[]>) => {
    moveItemInArray(state.widgets, event.previousIndex, event.currentIndex)
    state.widgets.forEach((item, i) => (item.index = i))
  })

  /**
   * 保存故事点变化
   */
  private _save(pristine: StoryPoint, current: StoryPoint) {
    let update: Observable<StoryPoint>
    // New point
    if (!current.id) {
      update = this.storyStore.createStoryPoint(current).pipe(
        tap((result) => {
          this.updatePoint({
            id: result.id
          })
        })
      )
    } else if (isNotEqual({ ...pristine, widgets: null }, { ...current, widgets: null })) {
      // update story point
      update = this.storyStore.updateStoryPoint(current).pipe(map(() => current))
    } else {
      this.widgetsDirtyQuery.reset()
    }

    if (update) {
      return update.pipe(
        tap(() => {
          const saveSuccess = this.getTranslation('Story.StoryPoint.SaveSuccess', 'Story page save success')
          this._snackBar.open(saveSuccess, '', {
            duration: 2000
          })

          this.widgetsDirtyQuery.reset()
        }),
        catchError((err, cah) => {
          const storyPointSaveFail = this.getTranslation('Story.StoryPoint.SaveFailed', 'Story page save failed')
          this._snackBar.open(storyPointSaveFail, err.status, {
            duration: 2000
          })
          return EMPTY
        })
      )
    }

    return of(true)
  }

  /**
   * 保存部件变化
   *
   * @param pristine
   * @param current
   * @returns
   */
  private _saveWidgets(pristine: StoryWidget[], current: StoryWidget[]) {
    if (current) {
      // 删除 Widgets
      const removes = compact(
        pristine?.map((widget) => {
          const currentWidget = current.find((item) => item.key === widget.key)
          if (isNil(currentWidget)) {
            return this.storyStore.removeStoryWidget(widget.storyId, widget.pointId, widget.id).pipe(
              tap(() => {
                pristine = pristine.filter((item) => item.id !== widget.id)
              })
            )
          }
          return null
        })
      )

      // 更新/创建 Widgets
      const updates = compact(
        current.map((widget, index) => {
          const pristineWidget = pristine?.find((item) => item.key === widget.key)
          if (pristineWidget) {
            if (isNotEqual(widget, pristineWidget)) {
              // update widget
              const update = cloneDeep(widget)
              return this.storyStore.updateStoryWidget(update).pipe(
                catchError((err) => {
                  const widgetUpdateFail = this.getTranslation('Story.Widget.UpdateFailed', 'Widget update failed')
                  this._snackBar.open(widgetUpdateFail, err.status, {
                    duration: 2000
                  })
                  return EMPTY
                })
              )
            }
          } else {
            // create widget
            return this.storyStore
              .createStoryWidget({
                ...widget,
                pointId: this.storyPoint.id
              })
              .pipe(
                tap((result) => {
                  this.setWidget([index, result])
                })
              )
          }
          return null
        })
      )

      const requests = [...removes, ...updates]
      if (isNotEmpty(requests)) {
        return combineLatest(requests).pipe(
          tap(() => {
            const widgetSaveSuccess = this.getTranslation('Story.Widget.SaveSuccess', 'Widget save success')
            this._snackBar.open(widgetSaveSuccess, '', {
              duration: 2000
            })
          })
        )
      }
    }

    return of(true)
  }

  readonly toggleFullscreen = this.updater((state, { key, fullscreen }: { key: ID; fullscreen: boolean }) => {
    const widget = state.widgets.find((item) => item.key === key)
    widget.fullscreen = fullscreen
    state.storyPoint.fullscreen = fullscreen
  })

  readonly removeFlexLayout = this.updater((state, key: string) => {
    const flexLayout = removeFlexLayout(state.storyPoint.responsive, key)
    if (flexLayout?.widgetKey) {
      this.removeWidget(flexLayout.widgetKey)
    }
  })

  /**
   * 根据输入结构重构状态中的结构
   */
  readonly refactFlexLayout = this.updater((state, flexLayout: FlexLayout) => {
    refactFlexLayout(state.storyPoint.responsive, flexLayout)
    // 清理不再被 Layout 引用到的 Widgets
    state.widgets = state.widgets.filter((item) => findFlexLayoutByWidgetKey(state.storyPoint.responsive, item.key))
  })

  /**
   * 只更新输入的本节点属性
   */
  readonly updateFlexLayout = this.updater((state, flexLayout: Partial<FlexLayout>) => {
    const item = findFlexLayout(state.storyPoint.responsive, flexLayout.key)
    if (item) {
      assign(item, omit(flexLayout, ['template', 'templateContext']))
    }
  })

  readonly setFilterBarOptions = this.updater((state, options: ISmartFilterBarOptions) => {
    state.storyPoint.filterBar.options = options
  })

  // get methods
  findFlexLayout(key: ID) {
    return this.get((state) => findFlexLayout(state.storyPoint.responsive, key))
  }

  findWidget(key: ID) {
    return this.get((state) => state.storyPoint?.widgets?.find((item) => item.key === key))
  }
}

function removeFlexLayout(flexLayout: FlexLayout, key: ID) {
  const index = flexLayout.children?.findIndex((item) => item.key === key)
  if (index > -1) {
    return flexLayout.children.splice(index, 1)[0]
  } else {
    return flexLayout.children?.find((item) => {
      return removeFlexLayout(item, key)
    })
  }
}

function findFlexLayout(flexLayout: FlexLayout, key: ID): FlexLayout {
  if (flexLayout?.key === key) {
    return flexLayout
  } else {
    return flexLayout?.children?.reduce(
      (accumulator, currentValue) => (accumulator ? accumulator : findFlexLayout(currentValue, key)),
      null
    )
  }
}

function findFlexLayoutByWidgetKey(flexLayout: FlexLayout, widgetKey: ID): FlexLayout {
  if (flexLayout?.widgetKey === widgetKey) {
    return flexLayout
  } else {
    return flexLayout?.children?.reduce(
      (accumulator, currentValue) => (accumulator ? accumulator : findFlexLayoutByWidgetKey(currentValue, widgetKey)),
      null
    )
  }
}

function refactFlexLayout(source: FlexLayout, target: FlexLayout) {
  const item = findFlexLayout(source, target.key) || omit(target, ['template', 'templateContext'])
  item.children = target.children?.map((child) => refactFlexLayout(source, child))
  return item
}
