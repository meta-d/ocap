import { formatNumber } from '@angular/common'
import { Component, InjectFlags, LOCALE_ID, inject } from '@angular/core'
import { Indicator, PeriodFunctions, cloneDeep, isNil } from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { AbstractStoryWidget, formatShortNumber } from '@metad/core'
import { graphic } from 'echarts/core'
import { Observable } from 'rxjs'
import { distinctUntilChanged, filter, map, shareReplay } from 'rxjs/operators'
import { IndicatorDataService } from './indicator-data.service'
import { ArrowDirection, IndicatorOption, IndicatorOptions } from './types'

interface HeadIndicator {
  currentValue: string
  shortUnit: string
  unit: string
  arrow?: ArrowDirection
  yoyValue?: string
  yoyUnit?: string
  yoyArrow?: ArrowDirection
}

interface MiddleIndicator extends HeadIndicator {
  title: string
}

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'pac-indicator-card',
  templateUrl: 'indicator.component.html',
  styleUrls: ['indicator.component.scss'],
  providers: [IndicatorDataService],
  host: {
    class: 'pac-indicator-card'
  }
})
export class IndicatorCardComponent extends AbstractStoryWidget<IndicatorOptions> {
  ArrowDirection = ArrowDirection

  public readonly indicatorDataService = inject(IndicatorDataService)
  private readonly _locale?: string = inject(LOCALE_ID, InjectFlags.Optional)

  option: any = {
    grid: {
      top: '0px',
      left: '0px',
      right: '0px',
      bottom: '0px'
    },
    tooltip: {
      show: false,
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#FF7600'
        }
      },
      appendToBody: true,
      className: 'nx-smart-echarts__tooltip'
      // formatter: (param) => {
      //   const value = thousandsCommaPipe(param[0].value)
      //   return `${param[0].name}: ${value}`
      // }
    },
    calculable: true,
    xAxis: {
      type: 'category',
      boundaryGap: false,
      show: false
      // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [
      {
        // data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line',
        itemStyle: {
          normal: {
            color: '#FF543B'
          }
        },
        areaStyle: {
          normal: {
            color: new graphic.LinearGradient(
              0,
              0,
              0,
              1,
              [
                {
                  offset: 0,
                  color: 'rgba(255,153,125,0.3)'
                },
                {
                  offset: 1,
                  color: 'rgba(255,153,125,0)'
                }
              ],
              false
            )
            // shadowColor: 'rgba(97,236,254,0.9)',
            // shadowBlur: 20,
          }
        },
        symbol: 'none' //取消折点圆圈
      }
    ]
  }

  public readonly placeholder$ = this.dataSettings$.pipe(
    map((dataSettings) => !(dataSettings?.dataSource && dataSettings?.entitySet))
  )

  readonly result$ = this.indicatorDataService.selectResult().pipe(
    map(({ data, error }) => {
      return !error ? data[0] : null
    }),
    filter((result) => !!result)
  )

  public readonly main$ = this.indicatorDataService.selectResult().pipe(
    map(({ data, error }) => {
      return !error ? data[0]?.main : null
    }),
    filter((main) => !!main?.data)
  )
  public readonly title$ = this.indicatorDataService.indicator$.pipe(
    map((indicator) => this.options.title || indicator?.name || indicator?.code)
  )

  public headIndicatorData$: Observable<HeadIndicator> = this.result$.pipe(
    map(({ main }) => main),
    map(({ data, indicator }) => {
      const locale = this.locale || this._locale
      return mapIndicatorResult(this.options, indicator, data[0], locale)
    }),
    untilDestroyed(this),
    shareReplay(1)
  )

  /**
   * 子指标数据计算结果
   */
  public subIndicators$: Observable<Array<MiddleIndicator>> = this.result$.pipe(
    map(({ subIndicators }) => subIndicators),
    filter((value) => !!value),
    map((subIndicators) => {
      const locale = this.locale || this._locale
      return subIndicators.map(({ data, indicator }, index) => {
        const option = this.options.indicators[index]
        return mapIndicatorResult(option, indicator, data[0], locale)
      })
    })
  )

  public chartOption$ = this.result$.pipe(
    map(({ trend }) => trend),
    map((trend) => {
      if (isNil(trend)) {
        return {
          show: false,
          option: {}
        }
      }

      const currentName = PeriodFunctions.CURRENT
      const timeHierarchyText = this.indicatorDataService.calendar.name
      const option: any = cloneDeep(this.option)
      const seriesData = trend.data
      option.xAxis.data = seriesData.map((x) => x[timeHierarchyText])
      option.series[0].data = seriesData.map((x) => x[currentName])
      return {
        show: true,
        option: option
      }
    })
  )

  public readonly isLoading$ = this.indicatorDataService.loading$
  public readonly error$ = this.indicatorDataService.selectResult().pipe(map((result) => result.error))

  // Subscriptions (effect)
  // slicers
  private slicersSub = this.selectionVariant$.subscribe((selectionVariant) => {
    this.indicatorDataService.selectionVariant = selectionVariant
    this.refresh()
  })
  // dataSettings
  private dataSettingsSub = this.dataSettings$.pipe(distinctUntilChanged()).subscribe((value) => {
    this.indicatorDataService.dataSettings = value
  })
  // options
  private optionsSub = this.options$.pipe(distinctUntilChanged()).subscribe({
    next: (value) => {
      this.indicatorDataService.patchState({
        indicatorId: value.code,
        indicators: value.indicators,
        disabledTrend: value.disabledTrend,
        lookBack: value.lookBack
      })
    }
  })
  // service inited
  private serviceSub = this.indicatorDataService.onAfterServiceInit().subscribe(() => {
    this.refresh()
  })

  private explainSub = this.indicatorDataService.selectResult().subscribe((queryReturn) => {
    this.setExplains([queryReturn])
  })

  refresh(force = false): void {
    this.indicatorDataService.refresh(force)
  }
}

/**
 * 计算指标结果
 *
 * @param options 指标配置
 * @param indicator 指标
 * @param data 指标数据
 * @param locale 国家语言代码
 * @returns
 */
function mapIndicatorResult(options: IndicatorOption, indicator: Indicator, data: unknown, locale: string) {
  const digitsInfo = options.digitsInfo || '1.0-1'
  const currentName = PeriodFunctions.CURRENT
  const rawValue = data?.[currentName]
  let result
  if (isNil(rawValue)) {
    result = {
      title: options.title || indicator.name,
      currentValue: '-',
      shortUnit: '',
      unit: indicator.unit,
      arrow: ''
    }
  } else {
    const [value, shortUnit] = formatShortNumber(indicator.unit === '%' ? rawValue * 100 : rawValue, locale)
    const currentValue = formatNumber(value, locale, digitsInfo)
    result = {
      title: options.title || indicator.name,
      currentValue,
      shortUnit,
      unit: indicator.unit,
      arrow: options.cost
        ? rawValue > 0
          ? ArrowDirection.DOWN
          : ArrowDirection.UP
        : rawValue > 0
        ? ArrowDirection.UP
        : ArrowDirection.DOWN
    }
  }

  if (!options.disabledYoy) {
    const yoyName = PeriodFunctions.YOY
    const unit = '%' // options.type === CardType.RATIO ? 'pct' : '%'
    if (isNil(data?.[yoyName])) {
      return {
        ...result,
        title: options.title || indicator.name,
        yoyValue: '-',
        yoyShortUnit: '',
        yoyUnit: unit,
        yoyArrow: null
      }
    } else {
      const yoyValue = Number(data[yoyName] || 0)
      const yoyArrow = options.cost
        ? yoyValue > 0
          ? ArrowDirection.DOWN
          : ArrowDirection.UP
        : yoyValue > 0
        ? ArrowDirection.UP
        : ArrowDirection.DOWN

      const [value, shortUnit] = formatShortNumber(yoyValue, locale)
      const currentValue = formatNumber(value, locale, digitsInfo)

      return {
        ...result,
        title: options.title || indicator.name,
        yoyValue: currentValue,
        yoyShortUnit: shortUnit,
        yoyUnit: unit,
        yoyArrow: yoyArrow
      }
    }
  }

  return result
}
