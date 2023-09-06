import { combineLatestWith, distinctUntilChanged, filter, map, Observable } from 'rxjs'
import { AnalyticsAnnotation } from '../annotations'
import { getEntityHierarchy, getEntityProperty, QueryReturn } from '../models'
import { isMeasure, QueryOptions } from '../types'
import { isEmpty, isNil, nonNullable } from '../utils'
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
    filter(nonNullable),
    combineLatestWith(this.selectEntityType()),
    map(([analyticsAnnotation, entityType]) => {
      return {
        rows: analyticsAnnotation.rows?.filter(Boolean).map((item) => ({
          ...item,
          property: isMeasure(item) ? getEntityProperty(entityType, item) : getEntityHierarchy(entityType, item)
        })),
        columns: analyticsAnnotation.columns?.filter(Boolean).map((item) => ({
          ...item,
          property: isMeasure(item) ? getEntityProperty(entityType, item) : getEntityHierarchy(entityType, item)
        }))
      }
    })
  )

  override onInit(): Observable<any> {
    return super.onInit()
      .pipe(
        map((dataSettings) => dataSettings.analytics),
        filter((analytics) => this.isMeetRequired(analytics))
      )
  }

  override selectQuery(options?: QueryOptions<any>): Observable<QueryReturn<T>> {
    if (!this.isMeetRequired(this.analyticsAnnotation)) {
      throw new Error(`Analytics rows or columns is required`)
    }
    options = options ?? {}
    options.rows = this.analyticsAnnotation.rows?.filter((item) => !isNil(item))
    options.columns = this.analyticsAnnotation.columns?.filter((item) => !isNil(item))
    return super.selectQuery(options)
  }

  protected isMeetRequired(analytics: AnalyticsAnnotation) {
    return !isEmpty(analytics?.rows) || !isEmpty(analytics?.columns)
  }

}
