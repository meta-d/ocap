import { isChartMapType, SmartChartEngine } from '@metad/ocap-core'
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  concatMap,
  EMPTY,
  filter,
  from,
  map,
  of,
  shareReplay,
  tap,
  withLatestFrom
} from 'rxjs'
import { bar } from './bar'
import { bar3d } from './bar3d'
import { heatmap } from './heatmap'
import { sankey, sunburst, treemap } from './hierarchy'
import { line } from './line'
import { line3d } from './line3d'
import { mapChart, mapChartAnnotation } from './maps/map'
import { scatter } from './scatter'
import { scatter3d } from './scatter3d'
import { EChartsOptions } from './types'

export class SmartEChartEngine extends SmartChartEngine {
  public readonly error$ = new BehaviorSubject(null)

  readonly echartsOptions$ = combineLatest([
    this.data$.pipe(
      filter((value) => !!value),
      tap((value) => console.log(`echarts data change:`, value))
    ),
    this.chartAnnotation$.pipe(
      filter((value) => !!value),
      concatMap((chartAnnotation) => {
        if (isChartMapType(chartAnnotation.chartType)) {
          return from(mapChartAnnotation(chartAnnotation))
        }

        return of(chartAnnotation)
      })
    ),
    this.settings$,
    this.options$
  ]).pipe(
    withLatestFrom(this.entityType$),
    map(([[data, chartAnnotation, settings, options], entityType]) => {
      const type = chartAnnotation.chartType.type

      if (type === 'Bar') {
        return {
          options: bar(data, chartAnnotation, entityType, settings, options as EChartsOptions)
        }
      }
      if (type === 'Line') {
        return {
          options: line(data, chartAnnotation, entityType, settings, null)
        }
      }

      if (type === 'Scatter' || type === 'EffectScatter') {
        return {
          options: scatter(data, chartAnnotation, entityType, settings, null)
        }
      }

      if (type === 'Heatmap') {
        return {
          options: heatmap(data, chartAnnotation, entityType, settings, null)
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

      if (type === 'Treemap') {
        return {
          options: treemap(data, chartAnnotation, entityType)
        }
      }

      if (type === 'Sunburst') {
        return {
          options: sunburst(data, chartAnnotation, entityType)
        }
      }

      if (type === 'Sankey') {
        return {
          options: sankey(data, chartAnnotation, entityType)
        }
      }

      if (type === 'Map') {
        return {
          options: mapChart(data, chartAnnotation, entityType, settings, options as EChartsOptions)
        }
      }

      return {
        options: line(data, chartAnnotation, entityType, settings, null)
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
