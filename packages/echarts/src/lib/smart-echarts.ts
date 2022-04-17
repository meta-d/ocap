import { SmartChartEngine } from '@metad/ocap-core'
import { combineLatest, filter, map, shareReplay, startWith, tap, withLatestFrom } from 'rxjs'

export class SmartEChartEngine extends SmartChartEngine {
  readonly echartsOptions$ = combineLatest([
    this.data$.pipe(filter(value => !!value), tap(options => console.log(`111111111 data 111111111`, options))),
    this.chartAnnotation$.pipe(filter(value => !!value))
  ]).pipe(
    map(([data, chartAnnotation]) => {
      const dimension = chartAnnotation.dimensions?.[0].dimension
      const measure = chartAnnotation.measures?.[0]?.measure
      return {
        xAxis: {
          type: 'category',
          data: data.results?.map((item: any) => item[dimension]),
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: data.results?.map((item: any) => item[measure]),
            type: 'bar'
          }
        ]
      }
    }),
    startWith({
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [120, 200, 150, 80, 70, 110, 130],
          type: 'bar'
        }
      ]
    }),
    tap(options => console.log(options)),
    shareReplay(1)
  )

  override selectChartOptions() {
    return this.echartsOptions$
  }
}
