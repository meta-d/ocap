import { SmartChartEngine } from '@metad/ocap-core'
import { BehaviorSubject, catchError, combineLatest, EMPTY, filter, map, shareReplay, startWith, tap, withLatestFrom } from 'rxjs'
import { bar } from './bar'
import { bar3d } from './bar3d'
import { line } from './line'
import { line3d } from './line3d'
import { scatter } from './scatter'
import { scatter3d } from './scatter3d'

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

      if (type === 'Bar3D') {
        return {
          options: bar3d(data, chartAnnotation, entityType)
        }
      }

      if (type === 'Scatter3D') {
        return {
          options: scatter3d(data, chartAnnotation, entityType)
        }
      }

      if (type === 'Line3D') {
        return {
          options: line3d(data, chartAnnotation, entityType)
        }
      }

      return {
        options: line(data, chartAnnotation, entityType)
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
