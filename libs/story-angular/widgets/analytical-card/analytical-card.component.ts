import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { ChangeDetectionStrategy, Component, Input, ViewChild, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { AnalyticalCardComponent, AnalyticalCardOptions } from '@metad/ocap-angular/analytical-card'
import { NgmSmartBusinessService } from '@metad/ocap-angular/core'
import {
  ChartAnnotation,
  ChartOptions,
  ChartSettings,
  FilteringLogic,
  ISlicer,
  OrderDirection,
  assignDeepOmitBlank,
  getEntityProperty,
  isAdvancedFilter,
  isEqual
} from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { SlicersCapacity } from '@metad/components/selection'
import { AbstractStoryWidget, StoryWidgetState, WidgetMenu, WidgetMenuType } from '@metad/core'
import { NxStoryService } from '@metad/story/core'
import { compact, isArray, isEmpty, isNil, negate } from 'lodash-es'
import { Observable, combineLatest, combineLatestWith, distinctUntilChanged, filter, map, shareReplay } from 'rxjs'
import { WidgetOrderMenu } from './types'

export interface WidgetAnalyticalCardOptions extends AnalyticalCardOptions {
  showDownloadButton?: boolean
  showDataButton?: boolean
  showFilter: boolean
  // selectionPresentationVariantsPosition?: 'Toolbar' | 'Bottom' | 'Top' | 'Left' | 'Right'
  toolbox?: {
    exportImage: boolean
  }

  enableLinkedAnalysis?: boolean
  realTimeLinked?: boolean
}

export interface AnalyticalCardState extends StoryWidgetState<WidgetAnalyticalCardOptions> {
  /**
   * Input states
   */
  chartOptions: ChartOptions
  chartSettings: ChartSettings

  /**
   * Inner states
   */
  // entityType: EntityType
}

@UntilDestroy({ checkProperties: true })
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-widget-analytical-card',
  templateUrl: './analytical-card.component.html',
  styleUrls: ['./analytical-card.component.scss'],
  providers: [NgmSmartBusinessService]
})
export class WidgetAnalyticalCardComponent extends AbstractStoryWidget<
  WidgetAnalyticalCardOptions,
  AnalyticalCardState
> {
  SlicersCapacity = SlicersCapacity

  private businessService = inject(NgmSmartBusinessService)
  private readonly storyService = inject(NxStoryService)

  // chart settings
  @Input() get chartOptions(): ChartOptions {
    return this.get((state) => state.chartOptions)
  }
  set chartOptions(value: ChartOptions) {
    this.patchState({ chartOptions: value })
  }
  public readonly chartOptions$ = this.select((state) => state.chartOptions).pipe(
    combineLatestWith(
      this.options$.pipe(
        map((options) => coerceBooleanProperty(options?.enableLinkedAnalysis ?? '')),
        distinctUntilChanged()
      ),

      this.storyService.storyOptions$.pipe(
        map((options) => options?.preferences?.story?.colors),
        distinctUntilChanged(isEqual)
      )
    ),
    map(([chartOptions, enableLinkedAnalysis, colors]) => {
      chartOptions = assignDeepOmitBlank({ color: colors }, chartOptions)
      if (enableLinkedAnalysis) {
        const echartOptions = { ...chartOptions }
        echartOptions.seriesStyle = { ...(echartOptions.seriesStyle ?? {}) }
        echartOptions.seriesStyle.selectedMode = 'single'
        return echartOptions
      }

      return chartOptions
    })
  )

  // chartSettings
  @Input() get chartSettings(): ChartSettings {
    return this.get((state) => state.chartSettings)
  }
  set chartSettings(value: ChartSettings) {
    this.patchState({ chartSettings: value })
  }
  public readonly chartSettings$ = this.select((state) => state.chartSettings).pipe(
    combineLatestWith(this.coreService.themeName$, this.locale$),
    map(([chartSettings, themaName, locale]: any) => ({
      ...(chartSettings ?? {}),
      locale,
      theme: themaName ?? 'default'
      // @deprecated use chartType script instead
      // customLogic: chartType?.scripts
    }))
  )

  public readonly measures$ = this.select((state) => state.dataSettings).pipe(
    map((dataSettings) => dataSettings?.chartAnnotation?.measures)
  )

  public readonly placeholder$ = this.dataSettings$.pipe(
    map((dataSettings) => !(dataSettings?.dataSource && dataSettings?.entitySet))
  )

  @ViewChild(AnalyticalCardComponent) analyticalCard!: AnalyticalCardComponent

  get chartAnnotation() {
    return this.dataSettings?.chartAnnotation
  }

  /**
   * 有责任对 ChartAnnotation 里没有完成设置的属性空值进行压缩处理
   */
  public readonly __dataSettings$ = this.dataSettings$.pipe(
    map((dataSettings) => ({
      ...dataSettings,
      chartAnnotation: {
        ...(dataSettings.chartAnnotation ?? {}),
        // 压缩未设置的空维度对象
        dimensions: compact(dataSettings.chartAnnotation?.dimensions.filter((item) => !!item?.dimension)),
        measures: compact(dataSettings.chartAnnotation?.measures.filter((item) => !!item?.measure))
      } as ChartAnnotation
    })),
    untilDestroyed(this),
    shareReplay(1)
  )

  readonly entityType$ = this.businessService.selectEntityType()

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effect)
  |--------------------------------------------------------------------------
  */
  private readonly entityTypeSub = this.entityType$.pipe(takeUntilDestroyed()).subscribe((entityType) => {
    this.entityType.set(entityType)
  })

  private menuActionSub = this.menuClick$?.subscribe((event) => {
    if (event.key.startsWith('sortby')) {
      let orderDirection = (event as WidgetOrderMenu).order
      if (orderDirection) {
        if (orderDirection === OrderDirection.ASC) {
          orderDirection = OrderDirection.DESC
        } else {
          orderDirection = null
        }
      } else {
        orderDirection = OrderDirection.ASC
      }
      this.orderBy({ by: event.name, order: orderDirection })
    }
  })

  private dataSettingsSub = this.__dataSettings$.subscribe((dataSettings) => {
    this.businessService.dataSettings = dataSettings
  })

  refresh(force = false) {
    // 强制刷新
    this.analyticalCard.refresh(force)
  }

  selectMenus(): Observable<WidgetMenu[]> {
    return combineLatest([
      this.measures$.pipe(filter((measures) => !isEmpty(measures))),
      this.presentationVariant$,
      this.entityType$
    ]).pipe(
      map(([measures, presentationVariant, entityType]) => {
        const ANALYTICAL_CARD = this.getTranslation('Story.Widgets.AnalyticalCard')
        return [
          {
            key: 'sort',
            icon: 'sort',
            name: ANALYTICAL_CARD?.Sort ?? 'Sort',
            type: WidgetMenuType.Menus,
            menus: measures.filter(negate(isNil)).map(({ measure }) => {
              const property = getEntityProperty(entityType, measure)
              const order = presentationVariant?.sortOrder?.find((item) => item?.by === measure)?.order
              const icon =
                order === OrderDirection.ASC ? 'arrow_upward' : order === OrderDirection.DESC ? 'arrow_downward' : null
              return {
                key: `sortby-${measure}`,
                name: measure,
                label: property?.caption,
                type: WidgetMenuType.Action,
                order,
                icon
              }
            })
          }
        ]
      }),
      untilDestroyed(this)
    )
  }

  onLinkAnalysis(event: ISlicer[]) {
    this.pin = !isEmpty(event)
    if (isEmpty(event)) {
      return this.slicersChange.emit([])
    }

    if (isAdvancedFilter(event)) {
      this.slicersChange.emit(event.children)
    } else {
      if (isArray(event)) {
        if (event.length > 1) {
          this.slicersChange.emit([{ filteringLogic: FilteringLogic.Or, children: event }])
        } else {
          this.slicersChange.emit(event)
        }
      } else {
        this.slicersChange.emit([event])
      }
    }
  }

  unlinkAnalysis() {
    this.onLinkAnalysis([])
  }
}
