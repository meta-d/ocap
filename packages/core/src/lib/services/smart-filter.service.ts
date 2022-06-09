import isEqual from 'lodash/isEqual'
import isNil from 'lodash/isNil'
import uniqBy from 'lodash/uniqBy'
import { combineLatest, distinctUntilChanged, filter, map, switchMap } from 'rxjs'
import { DSCoreService } from '../ds-core.service'
import { getEntityDefaultMeasure, getEntityHierarchy, getEntityProperty, getPropertyCaption } from '../models'
import { C_MEASURES, Dimension, getPropertyHierarchy, IMember, QueryOptions } from '../types'
import { SmartBusinessService, SmartBusinessState } from './smart-business.service'

export enum TypeAheadType {
  Local = 'Local',
  Remote = 'Remote'
}

export type TypeAhead = {
  type: TypeAheadType
  text?: string
  required?: boolean
  minimum?: number
}

export enum MemberSource {
  CUBE = 'CUBE',
  DIMENSION = 'DIMENSION'
}

export interface SmartFilterDataOptions {
  dimension?: Dimension
  typeAhead?: TypeAhead
  // the data source of value list members
  memberSource?: MemberSource
  //   // for members
  //   recursiveHierarchy?: RecursiveHierarchyType
  // 是否支持级联过滤
//   cascadingEffect?: boolean
  // 是否显示 All 成员
  showAllMember?: boolean
}

export interface SmartFilterState extends SmartBusinessState {
  options: SmartFilterDataOptions
}

export class SmartFilterService<T, State extends SmartFilterState = SmartFilterState> extends SmartBusinessService<
  T, State
> {
  set options(value) {
    this.patchState({ options: value } as State)
  }
  get options() {
    return this.get((state) => state.options)
  }
  get dimension() {
    return this.options?.dimension
  }

  public readonly dimension$ = this.select((state) => state.options?.dimension)

  readonly showAllMember$ = this.select((state) => state.options?.showAllMember)

  readonly selectOptions$ = combineLatest([
    this.selectResult().pipe(filter(({ data }) => !isNil(data))),
    this.showAllMember$
  ]).pipe(
    map(([{ data }, showAllMember]) => {
      const valueProperty = getPropertyHierarchy(this.dimension)
      const labelProperty = getPropertyCaption(getEntityProperty(this.entityType, valueProperty))
      const hierarchy = getEntityHierarchy(this.entityType, this.dimension)

      let results
      if (!showAllMember && hierarchy?.allMember) {
        results = data.filter((item) => item[valueProperty] !== hierarchy.allMember)
      } else {
        results = data
      }

      return uniqBy<IMember>(
        results.map((item) => ({
          value: item[valueProperty],
          label: item[labelProperty]
        })),
        'value'
      )
    })
  )

  constructor(dsCoreService: DSCoreService) {
    super(dsCoreService)
  }

  override onInit() {
    return super.onInit().pipe(
      switchMap(() =>
        this.dimension$.pipe(
          filter((dimension) => !!dimension),
          map((dimension) => ({
            dimension: dimension.dimension,
            hierarchy: dimension.hierarchy
          })),
          distinctUntilChanged(isEqual)
        )
      )
    )
  }

  override query(options?: QueryOptions) {
    const memberSource = this.options?.memberSource

    if (memberSource === MemberSource.DIMENSION) {
      this.entityService.getMembers<any>(this.dimension).pipe(map((data) => ({ data })))
    }

    const hProperty = getEntityHierarchy(this.getEntityType(), this.dimension)

    const dimension = {
      ...this.dimension,
      dimension: this.dimension.dimension,
      hierarchy: hProperty?.name,
      level: hProperty?.levels?.[hProperty.levels.length - 1]?.name,
      displayHierarchy: true
    }

    const measure = getEntityDefaultMeasure(this.getEntityType())

    options = options ?? {}
    options.rows = [dimension]
    options.columns = [
      {
        dimension: C_MEASURES,
        measure: measure.name
      } as Dimension
    ]

    options.filters = []

    // if (this.typeAhead?.type === TypeAheadType.Remote && !!this.typeAhead.text) {
    //   options.filters = [
    //     {
    //       dimension: { dimension: recursiveHierarchy.labelProperty },
    //       members: [{ value: this.typeAhead.text }],
    //       operator: FilterOperator.Contains
    //     }
    //   ]
    // }

    return super.query(options)
  }
}
