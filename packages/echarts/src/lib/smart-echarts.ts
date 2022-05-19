import {
  ChartSettings,
  FilteringLogic,
  getChartCategory,
  getChartSeries,
  getDimensionLabel,
  getEntityProperty,
  getPropertyName,
  getPropertyTextName,
  IChartClickEvent,
  isChartMapType,
  SmartChartEngine,
  SmartChartEngineState
} from '@metad/ocap-core'
import { ECharts } from 'echarts/core'
import { isArray, isEmpty, isEqual } from 'lodash'
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  from,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
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

export class SmartEChartEngine extends SmartChartEngine<SmartChartEngineState> {
  get echarts() {
    return this.echartsInstance$.value
  }
  set echarts(value) {
    this.echartsInstance$.next(value)
  }
  protected echartsInstance$ = new BehaviorSubject<ECharts>(null)

  public readonly error$ = new BehaviorSubject(null)

  readonly echartsOptions$ = combineLatest([
    this.data$.pipe(
      filter((value) => !!value)
      // tap((value) => console.log(`echarts data changed:`, value))
    ),
    this.chartAnnotation$.pipe(
      filter((chartAnnotation) => !isEmpty(chartAnnotation?.dimensions) || !isEmpty(chartAnnotation?.measures)),
      concatMap((chartAnnotation) => {
        if (isChartMapType(chartAnnotation.chartType)) {
          return from(mapChartAnnotation(chartAnnotation))
        }

        return of(chartAnnotation)
      })
      // tap((value) => console.log(`echarts chartAnnotation changed:`, value))
    ),
    this.settings$.pipe(distinctUntilChanged(isEqual)),
    this.options$.pipe(distinctUntilChanged(isEqual))
  ]).pipe(
    debounceTime(100),
    withLatestFrom(this.entityType$),
    map(([[data, chartAnnotation, settings, options], entityType]) => {
      try {
        settings = { ...(settings ?? ({} as ChartSettings)) }
        settings.locale = settings.locale ?? 'en'
        const type = chartAnnotation.chartType?.type

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

        return { options: {} }
      } catch (err) {
        console.error(err)
        this.error$.next(err)
        return { options: {} }
      }
      // throw new Error(`Unimplements type '${type}'`)
    }),
    tap((options) => console.log(options)),
    catchError((err) => {
      console.error(err)
      this.error$.next(err)
      return EMPTY
    }),
    shareReplay(1)
  )

  // echarts mouse events
  public readonly chartClick$ = this.createLazyEvent<any>('click').pipe(
    withLatestFrom(this.chartAnnotation$, this.entityType$),
    map(([event, chartAnnotation, entityType]) => {
      const dimension = getChartCategory(chartAnnotation)
      const chartSeries = getChartSeries(chartAnnotation)

      const property = getEntityProperty(entityType, dimension)
      const propertyName = getPropertyName(dimension)

      let item: any = event.data?.item || event.data
      let ftr
      if (chartSeries) {
        if (isArray(item)) {
          item = item[item.length - 1]
        }

        const value = 'XXX' // event.dimensionNames[event.encode[AxisEnum[this.valueAxis]][0]]

        const sFilter = {
          dimension: chartSeries,
          members: [
            {
              value
              // label: this.legendTexts?.get(value)
            }
          ]
        }

        ftr = {
          filteringLogic: FilteringLogic.And,
          children: [
            // TODO path -> dimension
            {
              dimension,
              members: [
                {
                  value: item[propertyName],
                  label: item[getPropertyTextName(property)]
                }
              ]
            },
            sFilter
          ]
        }
      } else {
        // filter 中 path 优先使用 hierarchy
        ftr = {
          dimension,
          members: [
            {
              value: item[propertyName],
              label: item[getPropertyTextName(property)]
            }
          ]
        }
      }

      return { ...event, event: event.event?.event, filter: ftr } as IChartClickEvent
    })
  )
  /**
   * https://echarts.apache.org/en/api.html#events.selectchanged
   */
  public readonly selectChanged$ = this.createLazyEvent<any>('selectchanged').pipe(
    withLatestFrom(this.echartsOptions$, this.chartAnnotation$, this.entityType$),
    debounceTime(100),
    withLatestFrom(this.chartClick$),
    map(([[event, echartsOptions, chartAnnotation, entityType], chartClick]: any) => {
      console.warn(event, echartsOptions)

      const category = getChartCategory(chartAnnotation)
      const categoryProperty = getEntityProperty(entityType, category)
      const chartSeries = getChartSeries(chartAnnotation)
      const slicers = event.selected.map(({ seriesIndex, dataIndex }) => {
        const series = echartsOptions.options.series[seriesIndex]
        const datasetIndex = series.datasetIndex
        const dataset = echartsOptions.options.dataset[datasetIndex]
        if (chartSeries) {
          // 逻辑与有 Series 维度下生成逻辑一致, 即数据使用的是数组矩阵 DataSet 的形式
          return {
            filteringLogic: FilteringLogic.And,
            children: [
              {
                dimension: category,
                members: dataIndex.map((index) => {
                  const value = dataset.source[0][index + 1]
                  return {
                    value,
                    label: dataset.categories?.find((item) => item.value === value)?.label
                  }
                })
              },
              {
                dimension: chartSeries,
                members: [
                  {
                    value: series.name,
                    label: series.caption
                  }
                ]
              }
            ]
          }
        }

        const label = getDimensionLabel(entityType, category)
        return {
          dimension: category,
          members: dataIndex.map((index) => ({
            value: dataset.source[index][category.dimension],
            label: dataset.source[index][label]
          }))
        }
      })

      return { event: chartClick.event, slicers }
    })
  )

  constructor() {
    super({} as SmartChartEngineState)
  }

  override selectChartOptions() {
    return this.echartsOptions$
  }

  protected createLazyEvent<T>(eventName: string) {
    return this.echartsInstance$.pipe(
      filter((c) => !!c),
      switchMap(
        (chart: ECharts) =>
          new Observable<T>((observer) => {
            chart.on(eventName, (params) => {
              observer.next(params as T)
            })
            return () => {
              if (!chart?.isDisposed()) {
                chart.off(eventName)
              }
            }
          })
      )
    )
  }
}
