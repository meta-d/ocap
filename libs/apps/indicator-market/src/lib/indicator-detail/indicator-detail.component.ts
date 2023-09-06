import { formatNumber } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  inject,
  InjectFlags,
  Input,
  LOCALE_ID,
  ViewChild
} from '@angular/core'
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet'
import { BusinessAreaRole, IBusinessAreaUser, IComment } from '@metad/contracts'
import { CopilotChatMessageRoleEnum } from '@metad/copilot'
import { DisplayDensity, NgmDSCoreService } from '@metad/ocap-angular/core'
import {
  C_MEASURES,
  calcRange,
  ChartAnnotation,
  ChartDimensionRoleType,
  ChartOrient,
  ChartSettings,
  DataSettings,
  Drill,
  EntityType,
  FilterOperator,
  getEntityCalendar,
  getEntityDimensions,
  getEntityHierarchy,
  getEntityLevel,
  getEntityProperty,
  getIndicatorMeasureName,
  getPropertyCaption,
  IFilter,
  Indicator,
  isAdvancedFilter,
  isEntityType,
  isEqual,
  ISlicer,
  isNil,
  OrderDirection,
  ReferenceLineAggregation,
  ReferenceLineType,
  ReferenceLineValueType,
  slicerAsString,
  TimeGranularity,
  TimeRangeType
} from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { TranslateService } from '@ngx-translate/core'
import { CommentsService, ToastrService } from '@metad/cloud/state'
import { convertTableToCSV, NgmCopilotService } from '@metad/core'
import { graphic } from 'echarts/core'
import { NGXLogger } from 'ngx-logger'
import { NgxPopperjsPlacements, NgxPopperjsTriggers } from 'ngx-popperjs'
import {
  BehaviorSubject,
  combineLatest,
  delay,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  map,
  Observable,
  pluck,
  scan,
  shareReplay,
  switchMap,
  withLatestFrom
} from 'rxjs'
import { IndicatoryMarketComponent } from '../indicator-market.component'
import { IndicatorsStore } from '../services/store'
import { IndicatorState, Trend, TrendColor, TrendReverseColor } from '../types'

@UntilDestroy({ checkProperties: true })
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-indicator-detail',
  templateUrl: 'indicator-detail.component.html',
  styleUrls: ['indicator-detail.component.scss']
})
export class IndicatorDetailComponent {
  @HostBinding('class.pac-indicator-detail')
  public readonly isIndicatorDetailComponent = true
  TREND = Trend
  DisplayDensity = DisplayDensity
  NgxPopperjsTriggers = NgxPopperjsTriggers
  NgxPopperjsPlacements = NgxPopperjsPlacements
  PERIODS = [
    {
      name: '1W',
      granularity: TimeGranularity.Day,
      lookBack: 7
    },
    {
      name: '1M',
      granularity: TimeGranularity.Day,
      lookBack: 30
    },
    {
      name: '3M',
      granularity: TimeGranularity.Day,
      lookBack: 90
    },
    {
      name: '6M',
      granularity: TimeGranularity.Day,
      lookBack: 180
    },
    {
      name: '1Y',
      granularity: TimeGranularity.Month,
      lookBack: 12
    },
    {
      name: '2Y',
      granularity: TimeGranularity.Month,
      lookBack: 24
    },
    {
      name: '3Y',
      granularity: TimeGranularity.Month,
      lookBack: 36
    }
  ]

  private store = inject(IndicatorsStore)
  private indicatoryMarketComponent = inject(IndicatoryMarketComponent)
  private logger = inject(NGXLogger)
  private locale: string = inject(LOCALE_ID)
  private data? = inject<{ id: string }>(MAT_BOTTOM_SHEET_DATA, InjectFlags.Optional)
  private _bottomSheetRef? = inject<MatBottomSheetRef<IndicatorDetailComponent>>(MatBottomSheetRef, InjectFlags.Optional)
  private _cdr = inject(ChangeDetectorRef)
  private toastrService = inject(ToastrService)
  private translateService = inject(TranslateService)
  private copilotService = inject(NgmCopilotService)
  private dsCoreService = inject(NgmDSCoreService)
  private commentsService = inject(CommentsService)

  private _id$ = new BehaviorSubject<string>(null)
  @Input()
  public get id() {
    return this._id$.value
  }
  public set id(value) {
    this._id$.next(value)
  }

  @Input() desktop = false

  @ViewChild('commentsContent') commentsContent: ElementRef<any>

  get copilotEnabled() {
    return this.copilotService.copilot?.enabled && this.copilotService.copilot?.apiKey
  }

  businessAreaUser: IBusinessAreaUser
  get modeler() {
    return (
      isNil(this.businessAreaUser) ||
      this.businessAreaUser?.role === BusinessAreaRole.Modeler ||
      this.businessAreaUser?.role === BusinessAreaRole.Adminer
    )
  }
  prompt = ''
  answering = false
  explainData
  drillExplainData = []
  messages = []
  relative = true

  public readonly period$ = new BehaviorSubject(null)
  get selectedPeriod() {
    return this.period$.value
  }
  set selectedPeriod(value) {
    this.period$.next(value)
  }

  public readonly freeSlicers$ = new BehaviorSubject<ISlicer[]>([])

  public readonly indicator$: Observable<IndicatorState> = this._id$.pipe(
    filter(Boolean),
    switchMap((id) => this.store.selectIndicator(id)),
    distinctUntilChanged(isEqual),
    untilDestroyed(this),
    shareReplay(1)
  )

  public readonly isMobile$ = this.indicatoryMarketComponent.isMobile$
  public readonly notMobile$ = this.indicatoryMarketComponent.notMobile$

  public readonly _dataSettings$ = this.indicator$.pipe(pluck('dataSettings'), filter(Boolean), distinctUntilChanged())

  public readonly title$ = this.indicator$.pipe(pluck('name'))

  public readonly entityType$ = this._dataSettings$.pipe(
    switchMap(({ dataSource, entitySet }) => this.dsCoreService.selectEntitySet(dataSource, entitySet)),
    map((entitySet) => entitySet?.entityType)
  )

  private readonly timeGranularity$ = combineLatest([
    this.dsCoreService.currentTime$.pipe(map(({ timeGranularity }) => timeGranularity)),
    this.period$.pipe(map((period) => period?.granularity))
  ]).pipe(map(([timeGranularity, granularity]) => granularity ?? timeGranularity))
  private readonly today$ = this.dsCoreService.currentTime$.pipe(map(({ today }) => today))
  private readonly calendar$ = combineLatest([
    this.indicator$.pipe(distinctUntilChanged((prev, curr) => prev?.calendar === curr?.calendar)),
    this.entityType$,
    this.timeGranularity$
  ]).pipe(
    map(([indicator, entityType, timeGranularity]) =>
      getEntityCalendar(entityType, indicator.calendar, timeGranularity)
    ),
    untilDestroyed(this),
    shareReplay(1)
  )

  private readonly timeSlicer$ = combineLatest([
    this.calendar$,
    this.timeGranularity$,
    this.today$,
    this.store.lookBack$,
    this.period$
  ]).pipe(
    map(([{ dimension, hierarchy, level }, timeGranularity, today, lookBack, period]) => {
      const timeRange = calcRange(today, {
        type: TimeRangeType.Standard,
        granularity: timeGranularity,
        formatter: level?.semantics?.formatter,
        lookBack: period?.lookBack ?? lookBack
      })

      return {
        dimension: {
          dimension: dimension.name,
          hierarchy: hierarchy.name
        },
        members: timeRange.map((value) => ({ value })),
        operator: FilterOperator.BT
      } as IFilter
    }),
    untilDestroyed(this),
    shareReplay(1)
  )

  public readonly dataSettings$ = combineLatest([
    this.indicator$,
    this.calendar$,
    this.timeSlicer$,
    this.freeSlicers$
  ]).pipe(
    map(([indicator, { dimension, hierarchy, level }, timeSlicer, freeSlicers]) => {
      // Remove free slicers that already in indicator restrictive filters
      freeSlicers = freeSlicers.filter(
        (slicer) => !indicator.filters?.find((filter) => filter.dimension?.dimension === slicer.dimension?.dimension)
      )

      return [
        {
          id: indicator.id,
          dataSource: indicator.dataSettings.dataSource,
          entitySet: indicator.dataSettings.entitySet,
          chartAnnotation: <ChartAnnotation>{
            chartType: {
              type: 'Line'
            },
            dimensions: [
              {
                dimension: dimension.name,
                hierarchy: hierarchy.name,
                level: level.name,
                role: ChartDimensionRoleType.Time,
                zeroSuppression: true,
                chartOptions: {
                  dataZoom: {
                    type: 'inside'
                  }
                }
              }
            ],
            measures: [
              {
                dimension: C_MEASURES,
                measure: getIndicatorMeasureName(indicator as Indicator),
                formatting: {
                  shortNumber: true,
                  unit: indicator.unit
                },
                referenceLines: [
                  {
                    label: 'Max',
                    type: ReferenceLineType.markPoint,
                    valueType: ReferenceLineValueType.dynamic,
                    aggregation: ReferenceLineAggregation.max
                  },
                  {
                    label: 'Min',
                    type: ReferenceLineType.markPoint,
                    valueType: ReferenceLineValueType.dynamic,
                    aggregation: ReferenceLineAggregation.min
                  }
                ]
              }
            ]
          },
          selectionVariant: {
            selectOptions: [timeSlicer, ...(indicator.filters ?? []), ...freeSlicers]
          },
          presentationVariant: {
            groupBy: indicator.dimensions.map((dimension) => ({ dimension, hierarchy: null, level: null }))
          }
        } as DataSettings
      ]
    }),
    distinctUntilChanged(isEqual)
  )

  public readonly chartOptions$: Observable<any> = this.indicator$.pipe(
    map((indicator) => indicator.trend),
    distinctUntilChanged(),
    map((indicatorTrend) => {
      const color =
        this.locale === 'zh-Hans'
          ? TrendReverseColor[Trend[indicatorTrend] ?? Trend[Trend.None]]
          : TrendColor[Trend[indicatorTrend] ?? Trend[Trend.None]]
      return {
        options: {
          animation: false
        },
        grid: {
          top: 50,
          right: 10
        },
        seriesStyle: {
          symbol: 'emptyCircle',
          symbolSize: 20,
          lineStyle: {
            color
          },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: color + '80'
              },
              {
                offset: 1,
                color: color + '00'
              }
            ])
          },
          itemStyle: {
            color: '#ffab00',
            borderColor: color,
            borderWidth: 3,
            opacity: 0
          },
          emphasis: {
            itemStyle: {
              opacity: 1
            }
          },
          selectedMode: 'single',
          select: {
            itemStyle: {
              opacity: 1
            }
          },
          markPoint: {
            label: {
              color: 'white'
            }
          }
        },
        valueAxis: {
          splitNumber: 3,
          position: 'right',
          minorTick: {
            show: true,
            splitNumber: 5
          }
        },
        categoryAxis: {
          splitLine: {
            show: true
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          position: (pos, params, el, elRect, size) => {
            const obj = {}
            obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 60
            obj[['top', 'bottom'][+(pos[1] < size.viewSize[1] / 2)]] = 20
            return obj
          }
        }
      }
    })
  )

  public readonly mom$ = this.indicator$.pipe(map((indicator) => (indicator.data?.MOM > 0 ? Trend.Up : Trend.Down)))
  public readonly yoy$ = this.indicator$.pipe(map((indicator) => (indicator.data?.YOY > 0 ? Trend.Up : Trend.Down)))

  // Free dimensions as slicers bar
  public readonly freeDimensions$ = this.indicator$.pipe(
    delay(300),
    withLatestFrom(this.timeSlicer$),
    map(([indicator, timeSlicer]) => {
      const dimensions = indicator.dimensions
        ?.filter(
          (dimension) =>
            dimension !== timeSlicer.dimension.dimension &&
            !indicator.filters?.find((filter) => filter.dimension?.dimension === dimension)
        )
        .map((dimension) => {
          return {
            dataSettings: indicator.dataSettings,
            dimension: {
              dimension
            },
            slicer: {}
          }
        })
      return dimensions?.length ? dimensions : null
    }),
    distinctUntilChanged(isEqual)
  )

  private readonly currentPeriodSlicer$ = new BehaviorSubject<ISlicer>(null)
  private readonly periodSlicer$ = combineLatest([
    this.timeSlicer$.pipe(
      map((timeSlicer) => ({
        ...timeSlicer,
        operator: FilterOperator.EQ,
        members: [timeSlicer.members[1]]
      }))
    ),
    this.currentPeriodSlicer$
  ]).pipe(map(([latest, current]) => current ?? latest))

  public readonly drillDimensions$ = combineLatest([
    this.indicator$,
    this.periodSlicer$,
    this.freeSlicers$,
    this.entityType$
  ]).pipe(
    map(([indicator, timeSlicer, freeSlicers, entityType]) => {
      const locale = this.store.locale
      const pieName = this.translateService.instant('IndicatorApp.Pie', {Default: 'Pie'})
      const barName = this.translateService.instant('IndicatorApp.Bar', {Default: 'Bar'})

      return indicator.filters?.map((filter, index) => {
        const slicers = [...indicator.filters]
        slicers.splice(index, 1)

        const property = getEntityProperty(entityType, filter.dimension)
        const hierarchy = getEntityHierarchy(entityType, filter.dimension)
        const measure = getIndicatorMeasureName(indicator as Indicator)
        return {
          id: `${indicator.code}/${filter.dimension?.dimension}`,
          title: hierarchy?.caption ?? property?.caption,
          dataSettings: {
            ...indicator.dataSettings,
            chartAnnotation: <ChartAnnotation>{
              chartType: {
                name: barName,
                type: 'Bar',
                orient: ChartOrient.horizontal
              },
              dimensions: [
                {
                  ...filter.dimension,
                  zeroSuppression: true,
                  chartOptions: {
                    dataZoom: {
                      type: 'inside'
                    }
                  }
                }
              ],
              measures: [
                {
                  dimension: C_MEASURES,
                  measure: getIndicatorMeasureName(indicator as Indicator),
                  formatting: {
                    shortNumber: true,
                    unit: indicator.unit
                  },
                  order: OrderDirection.DESC,
                  palette: {
                    name: 'Greens'
                  }
                }
              ]
            },
            selectionVariant: {
              selectOptions: [
                ...slicers,
                {
                  ...filter,
                  drill: Drill.Children
                },
                timeSlicer,
                ...freeSlicers
              ]
            }
          },
          chartSettings: <ChartSettings>{
            theme: 'dark',
            universalTransition: true,
            chartTypes: [
              {
                name: pieName,
                type: 'Pie',
                variant: 'Doughnut',
                chartOptions: {
                  seriesStyle: {
                    radius: ['30%', '70%'],
                    minShowLabelAngle: 2,
                    label: {
                      show: true,
                      position: this.desktop ? 'outside' : 'inside',
                      formatter: `{b}\n({d}%)`
                    }
                  },
                  tooltip: {
                    trigger: 'item'
                  }
                }
              }
            ]
          },
          chartOptions: {
            grid: {
              right: 20
            },
            categoryAxis: {
              inverse: true
            },
            valueAxis: {
              splitNumber: 3,
              position: 'right',
              minorTick: {
                show: true,
                splitNumber: 5
              }
            },
            seriesStyle: {
              colorBy: 'data',
              label: {
                show: true,
                position: 'insideRight',
                formatter: (params) => {
                  return formatNumber(params.data[measure], locale, '0.1-1')
                }
              }
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              },
              position: (pos, params, el, elRect, size) => {
                const obj = {}
                obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 20
                obj[['top', 'bottom'][+(pos[1] < size.viewSize[1] / 2)]] = 20
                return obj
              }
            }
          },
          period: slicerAsString(timeSlicer)
        }
      })
    })
  )

  public readonly comments$ = combineLatest([
    this.indicator$.pipe(map((indicator) => indicator?.comments)),
    this.periodSlicer$
  ]).pipe(
    map(([comments, periodSlicer]) =>
      comments.filter(
        (comment) => !comment.options?.period || comment.options?.period === periodSlicer?.members[0].value
      )
    )
  )

  /**
   * Subscriptions
   */
  // New indicator
  private _indicatorSub = this.indicator$.subscribe(async (indicator) => {
    // Clear free slicers when new indicator
    this.freeSlicers$.next([])
    this.messages = []
    this.prompt = ''

    if (indicator?.businessAreaId) {
      this.businessAreaUser = await this.store.getBusinessAreaUser(indicator.businessAreaId)
    } else {
      this.businessAreaUser = null
    }

    setTimeout(() => {
      this._cdr.detectChanges()
    })
  })
  
  constructor() {
    if (this.data?.id) {
      this.id = this.data.id
    }
  }

  trackById(index, item) {
    return item?.id
  }

  onClose(event) {
    this._bottomSheetRef.dismiss()
    event.preventDefault()
  }

  toggleFavorite(indicator: IndicatorState) {
    if (indicator.favour) {
      this.store.deleteFavorite(indicator)
    } else {
      this.store.createFavorite(indicator)
    }
  }

  async saveAsComment(id: string, comment: string, relative: boolean) {
    comment = comment?.trim()
    if (!comment) {
      return
    }
    try {
      this.answering = true
      const periodSlicer = await firstValueFrom(this.periodSlicer$)
      const result = await firstValueFrom(
        this.commentsService.createForIndicator(
          id,
          comment,
          relative
            ? {
                period: periodSlicer.members[0].value,
                periodCaption: periodSlicer.members[0].label
              }
            : {}
        )
      )
      this.prompt = ''
      this.answering = false
      this.store.addComment(result)
    } catch (err) {
      this.answering = false
      this.toastrService.error(err)
    }
  }

  async deleteComment(comment: IComment) {
    try {
      await firstValueFrom(this.commentsService.delete(comment.id))
      this.store.removeComment(comment)
    } catch (err) {
      this.toastrService.error(err)
    }
  }

  onPeriodSlicerChange(slicers: ISlicer[]) {
    if (isAdvancedFilter(slicers[0])) {
      this.currentPeriodSlicer$.next(slicers[0].children[0])
    }
  }

  onSlicerChange(event: ISlicer) {
    const slicers = [...this.freeSlicers$.value]
    const index = slicers.findIndex((item) => item.dimension.dimension === event.dimension.dimension)
    if (event.members?.length) {
      slicers.splice(index === -1 ? 0 : index, 1, event)
    } else if (index > -1) {
      slicers.splice(index, 1)
    }
    this.freeSlicers$.next(slicers)
  }

  onExplain(event) {
    this.logger.trace(`indicator app, detail explain:`, event)
    this.explainData = event
  }

  onDrillExplain(index, drill, event) {
    this.logger.trace(`indicator app, detail drilldown explain:`, event)
    this.drillExplainData[index] = {
      drill,
      event
    }
  }

  // For AI Copilot
  async askCopilot() {
    const queryResult = this.explainData?.[1]
    if (queryResult) {
      const lang = this.translateService.currentLang
      const dataSource = await firstValueFrom(this.dsCoreService.getDataSource(this.explainData?.[0].dataSource))
      const entityType = await firstValueFrom(dataSource.selectEntityType(this.explainData?.[0].entitySet))

      if (isEntityType(entityType)) {
        let dataPrompt =
          this.getPromptForCube(entityType) +
          '\n' +
          'The main data trend on time series is:\n' +
          this.getPromptForChartData(entityType, this.explainData)

        this.drillExplainData.forEach((drillItem) => {
          if (drillItem) {
            dataPrompt +=
              `\nThe drilldown data on dimension ${drillItem.drill.title} at ${drillItem.drill.period} is:\n` +
              this.getPromptForChartData(entityType, drillItem.event)
          }
        })

        const userMessage = {
          prompt: this.prompt,
          content: '',
          relative: true
        }
        this.messages.push(userMessage)

        this.prompt = ''
        this.answering = true
        this.copilotService
          .chatStream([
            {
              role: CopilotChatMessageRoleEnum.System,
              content: `If you are a data analysis expert, please respond based on the prompts and provided data. Answer use language ${lang}`
            },
            {
              role: CopilotChatMessageRoleEnum.User,
              content: userMessage.prompt + ':\n' + dataPrompt
            }
          ])
          .pipe(
            scan((acc, value: any) => acc + (value?.choices?.[0]?.delta?.content ?? ''), ''),
            map((content) => content.trim())
          )
          .subscribe({
            next: (content) => {
              userMessage.content = content
              this._cdr.detectChanges()
            },
            error: () => {
              this.answering = false
              this._cdr.detectChanges()
            },
            complete: () => {
              this.answering = false
              this._cdr.detectChanges()
            }
          })
      }
    }
  }

  getPromptForCube(entityType: EntityType) {
    return `The model ${entityType.caption} contain dimensions: ${getEntityDimensions(entityType)
      .map((dimension) => dimension.caption)
      .join(', ')}`
  }

  getPromptForChartData(entityType: EntityType, explainData) {
    const queryResult = explainData?.[1]
    const chartAnnotation = explainData?.[0].chartAnnotation

    const dimension = chartAnnotation.dimensions[0]
    const dimensionProperty = getEntityHierarchy(entityType, dimension)
    const dimensionLevel = getEntityLevel(entityType, dimension)
    const dimensionCaption = getPropertyCaption(dimensionProperty)
    const measure = chartAnnotation.measures[0]
    const measureProperty = getEntityProperty(entityType, measure)

    const dataPrompt = convertTableToCSV(
      [
        {
          name: dimensionProperty.name,
          caption: dimensionLevel?.caption ?? dimensionProperty.caption + ' Key'
        },
        {
          name: dimensionCaption,
          caption: dimensionLevel?.caption ?? dimensionProperty.caption
        },
        {
          name: measureProperty.name,
          caption: measureProperty.caption
        }
      ],
      queryResult.data
    )

    return dataPrompt
  }

  scrollBottom() {
    setTimeout(() => {
      this.commentsContent.nativeElement.scrollTo({
        top: this.commentsContent.nativeElement.scrollHeight,
        left: 0,
        behavior: 'smooth'
      })
    }, 300)
  }

  @HostBinding('class.reverse-semantic-color')
  public get reverse() {
    return this.locale === 'zh-Hans'
  }
}
