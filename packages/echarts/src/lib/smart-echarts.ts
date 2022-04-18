import { SmartChartEngine } from '@metad/ocap-core'
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  EMPTY,
  filter,
  map,
  shareReplay,
  startWith,
  tap,
  withLatestFrom
} from 'rxjs'
import { bar } from './bar'
import { line } from './line'
import { scatter } from './scatter'

export class SmartEChartEngine extends SmartChartEngine {
  public readonly error$ = new BehaviorSubject(null)

  readonly echartsOptions$ = combineLatest([
    this.data$.pipe(
      filter((value) => !!value),
      tap((value) => console.log(`echarts data change:`, value))
    ),
    this.chartAnnotation$.pipe(filter((value) => !!value))
  ]).pipe(
    withLatestFrom(this.entityType$),
    map(([[data, chartAnnotation], entityType]) => {
      const type = chartAnnotation.chartType.type

      if (type === 'Bar') {
        return {
          options: bar(data, chartAnnotation, entityType)
        }
      }
      if (type === 'Line') {
        return {
          options: line(data, chartAnnotation, entityType)
        }
      }

      if (type === 'Scatter' || type === 'EffectScatter') {
        return {
          options: scatter(data, chartAnnotation, entityType)
        }
      }

      return {
        options: line(data, chartAnnotation, entityType)
      }
    }),
    startWith({
      options: {
        // xAxis: {
        //   type: 'category',
        //   data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        // },
        // yAxis: {
        //   type: 'value'
        // },
        // series: [
        //   {
        //     data: [120, 200, 150, 80, 70, 110, 130],
        //     type: 'bar'
        //   }
        // ]
      }
    }),
    tap((options) => console.log(options)),
    catchError((err) => {
      console.error(err)
      this.error$.next(err)
      return EMPTY
    }),
    shareReplay(1)
  )

  override selectChartOptions() {
    return this.echartsOptions$
  }
}
