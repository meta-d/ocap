import isEqual from 'lodash/isEqual'
import isEmpty from 'lodash/isEmpty'
import isString from 'lodash/isString'
import { catchError, distinctUntilChanged, EMPTY, filter, Observable, of, shareReplay, switchMap } from 'rxjs'
import { DSCoreService } from '../ds-core.service'
import { FilterMergeMode, isTimeRangesSlicer, putFilter, workOutTimeRangeSlicers } from '../filter'
import { getEntityProperty, QueryReturn } from '../models'
import { FilteringLogic, IFilter, isAdvancedSlicer, ISlicer, isSlicer, QueryOptions, ServiceInit } from '../types'
import { EntityBusinessService, EntityBusinessState } from './entity.service'
import { SmartFilterBarService } from './smart-filter-bar.service'

export interface SmartBusinessState extends EntityBusinessState {
  //
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

  constructor(dsCoreService: DSCoreService, public smartFilterBar?: SmartFilterBarService) {
    super(dsCoreService)
  }

  /**
   * Service 初始化, 判断满足条件后才能往后发送事件, 否则可能造成后续逻辑报错
   *
   * @returns
   */
  onInit(): Observable<any> {
    // 根部使用 dataSettings 作为判断条件合适吗 ?
    return this.dataSettings$.pipe(filter((value) => !!value), distinctUntilChanged(isEqual))
  }
  onAfterServiceInit(): Observable<void> {
    return this.serviceInit$
  }

  override query(options?: QueryOptions<any>): Observable<QueryReturn<T>> {
    return (this.smartFilterBar?.onChange() ?? of([])).pipe(
      switchMap((filters) => {
        let _filters: Array<ISlicer> = options?.filters || []

        // from SmartFilterBar
        filters?.forEach((ftr) => {
          _filters = putFilter(_filters, ftr, FilterMergeMode.ignore)
        })

        return super.query({
          ...(options ?? {}),
          filters: _filters
        })
      })
    )
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

    let _filters: Array<ISlicer> = queryOptions?.filters || []

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
        else if (isTimeRangesSlicer(v)) {
          console.warn(`Time range filter`, v)
          const { today, timeGranularity } = this.dsCoreService.getToday()
          const ranges = workOutTimeRangeSlicers(today, v, entityType)

          // const ranges = this.coreService.calcRanges(v).map((range) => {
          //   console.warn(`Time range filter results`, range)
          //   if (range.result[0] === range.result[1]) {
          //     return new NxFilter(v.dimension, range.result[0])
          //   }
          //   return new NxFilter(v.dimension, range.result, NxFilterOperator.BT)
          // })

          _filters = putFilter(
            _filters,
            (ranges.length > 1
              ? {
                  filteringLogic: FilteringLogic.And,
                  children: ranges
                }
              : ranges[0]) as IFilter
          )
        } else if (isSlicer(v) && !isEmpty(v.members)) {
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

    // ignore Unknown Property
    const ignoreUnknownProperty = this.get((state) => state.dataSourceOptions?.settings?.ignoreUnknownProperty)
    if (ignoreUnknownProperty) {
      _filters = _filters.filter((f) => {
        if (f.dimension) {
          if (isAdvancedSlicer(f)) {
            return !!getEntityProperty(entityType, f.context[0])
          }
          return !!getEntityProperty(entityType, f.dimension)
        }
        return true
      })
    }

    queryOptions.filters = _filters

    return queryOptions
  }
}
