import { isEmpty, isNil } from 'lodash'
import { combineLatestWith, distinctUntilChanged, filter, map, Observable, switchMap } from 'rxjs'
import { getEntityProperty, QueryReturn } from '../models'
import { QueryOptions } from '../types'
import { SmartBusinessService } from './smart-business.service'

export class AnalyticsBusinessService<T> extends SmartBusinessService<T> {
  public readonly analyticsAnnotation$ = this.dataSettings$.pipe(
    map((dataSettings) => dataSettings?.analytics),
    distinctUntilChanged()
  )

  get analyticsAnnotation() {
    return this.get((state) => state.dataSettings?.analytics)
  }

  /**
   * 合并相应 Entity Property 后的 Analytics 注解
   */
  public readonly analytics$ = this.analyticsAnnotation$.pipe(
    filter((value) => !!value),
    combineLatestWith(this.entityType$),
    map(([analyticsAnnotation, entityType]) => {
      return {
        rows: analyticsAnnotation.rows?.map((item) => ({
          ...item,
          property: getEntityProperty(entityType, item)
        })),
        columns: analyticsAnnotation.columns?.map((item) => ({
          ...item,
          property: getEntityProperty(entityType, item)
        }))
      }
    })
  )

  override onInit(): Observable<any> {
    return super
      .onInit()
      .pipe(
        map((dataSettings) => dataSettings.analytics),
        filter((analytics) => !isEmpty(analytics?.rows) || !isEmpty(analytics?.columns))
        // switchMap((dataSettings) =>
        //   this.analyticsAnnotation$.pipe(
        //     filter((analytics) => !isEmpty(analytics?.rows) || !isEmpty(analytics?.columns))
        //   )
        // )
      )
  }

  override query(options?: QueryOptions<any>): Observable<QueryReturn<T>> {
    options = options ?? {}
    options.rows = this.analyticsAnnotation.rows?.filter((item) => !isNil(item))
    options.columns = this.analyticsAnnotation.columns?.filter((item) => !isNil(item))
    return super.query(options)
  }
}
