import { distinctUntilChanged, map, Observable } from 'rxjs'
import { QueryReturn } from '../models'
import { QueryOptions } from '../types'
import { SmartBusinessService } from './smart-business.service'

export class ChartBusinessService<T> extends SmartBusinessService<T> {
  public readonly chartAnnotation$ = this.dataSettings$.pipe(
    map((dataSettings) => dataSettings?.chartAnnotation),
    distinctUntilChanged()
  )

  get chartAnnotation() {
    return this.get(state => state.dataSettings?.chartAnnotation)
  }

  override query(options?: QueryOptions<any>): Observable<QueryReturn<T>> {
    options = options ?? {}
    options.rows = this.chartAnnotation.dimensions
    options.columns = this.chartAnnotation.measures
    return super.query(options)
  }
}
