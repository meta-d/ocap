import {
  AfterViewInit,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  Input,
  LOCALE_ID,
  computed,
  effect,
  inject,
  runInInjectionContext,
  signal
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { TinyArea } from '@antv/g2plot/esm/plots/tiny-area'
import { Store } from '@metad/cloud/state'
import { LanguagesEnum } from '@metad/core'
import { TranslateService } from '@ngx-translate/core'
import { BehaviorSubject } from 'rxjs'
import { map } from 'rxjs/operators'
import { IndicatorState, StatisticalType, Trend, TrendColor, TrendReverseColor } from '../types'

@Directive({
  selector: '[pacSparkLine]'
})
export class AppSparkLineDirective implements AfterViewInit {
  private locale = inject(LOCALE_ID)
  private elRef = inject(ElementRef)
  readonly destroyRef = inject(DestroyRef)
  readonly #injector = inject(Injector)
  readonly #store = inject(Store)
  readonly #translate = inject(TranslateService)

  @Input() get indicator(): IndicatorState {
    return this._indicator$.value
  }
  set indicator(value) {
    this._indicator$.next(value)
  }
  private _indicator$ = new BehaviorSubject(null)

  @Input() get statisticalType() {
    return this.statisticalType$()
  }
  set statisticalType(value) {
    this.statisticalType$.set(value)
  }
  readonly statisticalType$ = signal(StatisticalType.CurrentPeriod)
  readonly indicatorTrends$ = toSignal(this._indicator$.pipe(map((indicator) => indicator?.trends)))
  readonly primaryTheme$ = toSignal(this.#store.primaryTheme$)

  readonly config$ = computed(() => {
    const trends = this.indicatorTrends$()
    const measureFilter = this.statisticalType$()
    let data = []
    switch (measureFilter) {
      case StatisticalType.CurrentPeriod:
        data = trends?.map((y) => y['CURRENT']) || []
        break
      case StatisticalType.Accumulative:
        data = trends?.map((y) => y['YTD']) || []
        break
    }

    const color =
      this.#translate.currentLang === LanguagesEnum.SimplifiedChinese
        ? TrendReverseColor[Trend[this.indicator.trend]]
        : TrendColor[Trend[this.indicator.trend]]
    return {
      data,
      color
    }
  })

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

    runInInjectionContext(this.#injector, () => {
      effect(() => {
        const { data, color } = this.config$()
        tinyArea.changeData(data)
        tinyArea.update({
          line: {
            color: color
          },
          areaStyle: {
            fill: `l(270) 0:${color}00 1:${color}${this.primaryTheme$() === 'dark' ? '' : '70'}`
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
                stroke: color
              }
            }
          ]
        })
      })
    })

    tinyArea.render()
  }
}
