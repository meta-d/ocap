import { AfterViewInit, Directive, ElementRef, Input, LOCALE_ID, inject } from '@angular/core'
import { TinyArea } from '@antv/g2plot/esm/plots/tiny-area'
import { isNil } from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { BehaviorSubject, combineLatest } from 'rxjs'
import { distinctUntilChanged, filter, map, pluck } from 'rxjs/operators'
import { IndicatorState, Trend, TrendColor, TrendReverseColor } from '../types'
import { StatisticalType } from '../types'

@UntilDestroy()
@Directive({
  selector: '[pacSparkLine]'
})
export class AppSparkLineDirective implements AfterViewInit {
  private locale = inject(LOCALE_ID)
  private elRef = inject(ElementRef)

  @Input() get indicator(): IndicatorState {
    return this._indicator$.value
  }
  set indicator(value) {
    this._indicator$.next(value)
  }
  private _indicator$ = new BehaviorSubject(null)

  @Input() get statisticalType() {
    return this.statisticalType$.value
  }
  set statisticalType(value) {
    this.statisticalType$.next(value)
  }
  protected statisticalType$ = new BehaviorSubject<string>(StatisticalType.CurrentPeriod)

  public readonly config$ = combineLatest([
    this._indicator$.pipe(
      filter((item) => !isNil(item)),
      pluck('trends'),
      distinctUntilChanged(),
    ),
    this.statisticalType$.pipe(
      filter((item) => !isNil(item)),
      distinctUntilChanged(),
    )
  ]).pipe(
    map(([trends, measureFilter]) => {
      let data = []
      switch (measureFilter) {
        case StatisticalType.CurrentPeriod:
          data = trends?.map((y) => y['CURRENT']) || []
          break
        case StatisticalType.Accumulative:
          data = trends?.map((y) => y['YTD']) || []
          break
      }

      const color = this.locale === 'zh-Hans' ? TrendReverseColor[Trend[this.indicator.trend]] : TrendColor[Trend[this.indicator.trend]]
      return {
        data,
        color
      }
    })
  )

  ngAfterViewInit(): void {
    const tinyArea = new TinyArea(this.elRef.nativeElement, {
      animation: false,
      autoFit: true,
      data: [],
      smooth: false,
      line: {
        size: 2
      },
      tooltip: false
    })

    this.config$.pipe(untilDestroyed(this)).subscribe(({ data, color }) => {
      tinyArea.changeData(data)
      tinyArea.update({
        line: {
          color: color
        },
        areaStyle: {
          fill: `l(270) 0:#00000000 1:${color}`
        },
        annotations: [
          {
            type: 'line',
            start: ['min', 'mean'],
            end: ['max', 'mean'],
            // text: {
            //   content: '平均值',
            //   offsetY: -2,
            //   style: {
            //     textAlign: 'left',
            //     fontSize: 10,
            //     fill: 'rgba(44, 53, 66, 0.45)',
            //     textBaseline: 'bottom',
            //   },
            // },
            style: {
              lineWidth: 2,
              lineDash: [2, 2],
              stroke: color,
            },
          },
      ]
      })
    })

    tinyArea.render()
  }

}
