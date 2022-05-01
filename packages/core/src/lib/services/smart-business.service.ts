import { isEmpty, isString } from 'lodash'
import { catchError, EMPTY, Observable, of, shareReplay, switchMap } from 'rxjs'
import { PresentationVariant, SelectionVariant } from '../annotations'
import { IFilter, isAdvancedFilter, isFilter, ISlicer, isSlicer, QueryOptions, ServiceInit } from '../types'
import { EntityBusinessService, EntityBusinessState } from './entity.service'

export interface SmartBusinessState extends EntityBusinessState {
  selectionVariant?: SelectionVariant
  presentationVariant?: PresentationVariant
}

export class SmartBusinessService<T, State extends SmartBusinessState = SmartBusinessState>
  extends EntityBusinessService<T, State>
  implements ServiceInit
{
  private serviceInit$ = this.initialise$.pipe(
    switchMap(() =>
      this.onInit().pipe(
        catchError((err, caught) => {
          console.error(err)
          return EMPTY
        })
      )
    ),
    shareReplay(1)
  )

  onInit(): Observable<any> {
    return of(true)
  }
  onAfterServiceInit(): Observable<void> {
    return this.serviceInit$
  }

  /**
   * 过滤器存在优先级覆盖顺序
   * 1. queryOptions 指定的过滤器
   * 2. FilterBar 中选择的过滤器
   * 3. SelectionVariant 中指定的过滤器
   * 
   * @param queryOptions 
   * @returns 
   */
  override calculateFilters(queryOptions?: QueryOptions) {
    // const querySettings = this.querySettings$.value
    const entityType = this.getEntityType()

    const _filters: Array<ISlicer> = queryOptions?.filters || []

    // // from SmartFilterBar
    // this.smartFilterBar?.getFilters()?.forEach((ftr) => {
    //   _filters = putFilter(_filters, ftr, FilterMergeMode.ignore)
    // })

    // from SelectionVariant
    const selectionVariant = this.selectionVariant
    // before filters
    if (selectionVariant?.selectOptions) {
      const filterString = []
      selectionVariant.selectOptions.forEach((v) => {
        if (isString(v)) {
          filterString.push(v)
        }
        // else if (isFilter(v) || isAdvancedFilter(v)) {
        //   _filters = putFilter(_filters, v)
        // }
        // else if (isTimeRangesSlicer(v)) {

        //   console.warn(`Time range filter`, v)
        //   const {today, timeGranularity} = this.coreService.getToday()
        //   const ranges = workOutTimeRangeSlicers(today, v, this.getEntityType())

        //   // const ranges = this.coreService.calcRanges(v).map((range) => {
        //   //   console.warn(`Time range filter results`, range)
        //   //   if (range.result[0] === range.result[1]) {
        //   //     return new NxFilter(v.dimension, range.result[0])
        //   //   }
        //   //   return new NxFilter(v.dimension, range.result, NxFilterOperator.BT)
        //   // })

        //   _filters = putFilter(
        //     _filters,
        //     (ranges.length > 1
        //       ? {
        //           filteringLogic: FilteringLogic.And,
        //           children: ranges
        //         }
        //       : ranges[0]) as NxIFilter
        //   )
        // }
        else if (isSlicer(v) && !isEmpty(v.members)) {
          _filters.push(v)
          // _filters = putFilter(_filters, v)
        } else {
          // ???
          _filters.push(v as unknown as IFilter)
        }
      })

      if (!isEmpty(filterString)) {
        queryOptions.filterString = queryOptions.filterString
          ? `${queryOptions.filterString} ${filterString.join(' ')}`
          : filterString.join(' ')
      }
    }

    // // from FilterContainer, 会覆盖来自 SmartFilterBar 和 SelectionVariant 的 filters
    // this.filterContainer?.getFilters()?.forEach((filter) => {
    //   _filters = putFilter(_filters, filter)
    // })

    // // ignore Unknown Property
    // if (querySettings?.ignoreUnknownProperty) {
    //   _filters = _filters.filter((f) => {
    //     if (f.dimension) {
    //       if (isAdvancedSlicer(f)) {
    //         return !!getEntityProperty(entityType, f.context[0])
    //       }
    //       return !!getEntityProperty(entityType, f.dimension)
    //     }
    //     return true
    //   })
    // }

    queryOptions.filters = _filters

    return queryOptions
  }
}
