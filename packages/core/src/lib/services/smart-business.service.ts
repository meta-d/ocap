import { catchError, distinctUntilChanged, EMPTY, filter, Observable, shareReplay, switchMap } from 'rxjs'
import { DSCoreService } from '../ds-core.service'
import { FilterMergeMode, isTimeRangesSlicer, putFilter, workOutTimeRangeSlicers } from '../filter'
import { getEntityProperty, QueryReturn } from '../models'
import { FilteringLogic, IFilter, isAdvancedSlicer, ISlicer, isSlicer, QueryOptions } from '../types'
import { isEmpty, isEqual, isString, nonNullable } from '../utils'
import { EntityBusinessService, EntityBusinessState } from './entity-business.service'
import { SmartFilterBarService } from './smart-filter-bar.service'

/**
 * Service 初始化过程的通用接口
 */
export interface ServiceInit {
  /**
   * Service 初始化方法
   */
  onInit(): Observable<any>
  /**
   * 可监听的初始化完成状态
   */
  onAfterServiceInit(): Observable<void>
}

export type SmartBusinessState = EntityBusinessState

export class SmartBusinessService<T, State extends SmartBusinessState = SmartBusinessState>
  extends EntityBusinessService<T, State>
  implements ServiceInit
{
  private serviceInit$ = this.initialise$.pipe(
    switchMap(() =>
      this.onInit().pipe(
        catchError((err, caught) => {
          /**
           * @todo 需要重构更好的方式
           */
          console.error(err)
          return EMPTY
        })
      )
    ),
    shareReplay(1)
  )

  constructor(dsCoreService: DSCoreService, public smartFilterBar?: SmartFilterBarService) {
    super(dsCoreService)

    this.smartFilterBar?.onGo().subscribe(() => {
      this.refresh()
    })
  }

  /**
   * Service 初始化, 判断满足条件后才能往后发送事件, 否则可能造成后续逻辑报错
   *
   * @returns
   */
  onInit(): Observable<any> {
    // 根部使用 dataSettings 作为判断条件合适吗 ?
    return this.dataSettings$.pipe(filter(nonNullable), distinctUntilChanged(isEqual))
  }
  onAfterServiceInit(): Observable<void> {
    return this.serviceInit$
  }

  override selectQuery(options?: QueryOptions<any>): Observable<QueryReturn<T>> {
    // Combine slicers from filer bar service
    let _filters: Array<ISlicer> = options?.filters ?? []
    // from SmartFilterBar
    this.smartFilterBar?.slicers?.forEach((ftr) => {
      _filters = putFilter(_filters, ftr, FilterMergeMode.ignore)
    })

    return super.selectQuery({
      ...(options ?? {}),
      filters: _filters
    })
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
    const entityType = this.entityType

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
          const { today } = this.dsCoreService.getToday()
          const ranges = workOutTimeRangeSlicers(today, v, entityType)

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
