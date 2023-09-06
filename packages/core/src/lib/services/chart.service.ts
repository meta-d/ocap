import { distinctUntilChanged, filter, map, Observable } from 'rxjs'
import { QueryReturn } from '../models'
import { QueryOptions } from '../types'
import { isEqual, pick } from '../utils'
import { SmartBusinessService } from './smart-business.service'

/**
 * Service ChartAnnotation data
 */
export class ChartBusinessService<T> extends SmartBusinessService<T> {
  public readonly chartAnnotation$ = this.dataSettings$.pipe(
    map((dataSettings) => dataSettings?.chartAnnotation),
    distinctUntilChanged()
  )

  get chartAnnotation() {
    return this.get(state => state.dataSettings?.chartAnnotation)
  }

  override onInit(): Observable<any> {
    return this.dataSettings$.pipe(
      // Ready when measures is not empty
      filter((dataSettings) => !!dataSettings?.chartAnnotation?.measures?.length),
      distinctUntilChanged((a, b) => {
        return isEqual(
          {
            ...a,
            chartAnnotation: pick(a.chartAnnotation, 'dimensions', 'measures')
          }, {
            ...b,
            chartAnnotation: pick(b.chartAnnotation, 'dimensions', 'measures')
          })
      })
    )
  }

  override selectQuery(options?: QueryOptions<any>): Observable<QueryReturn<T>> {
    options = options ?? {}
    options.rows = this.chartAnnotation.dimensions
    options.columns = this.chartAnnotation.measures
    return super.selectQuery(options)
  }
}
