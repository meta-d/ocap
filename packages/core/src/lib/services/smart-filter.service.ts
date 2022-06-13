import isEqual from 'lodash/isEqual'
import isNil from 'lodash/isNil'
import uniqBy from 'lodash/uniqBy'
import { combineLatest, distinctUntilChanged, filter, map, switchMap } from 'rxjs'
import { DSCoreService } from '../ds-core.service'
import {
  DimensionMemberRecursiveHierarchy,
  getEntityDefaultMeasure,
  getEntityHierarchy,
  IDimensionMember
} from '../models'
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
  // 是否显示 All 成员
  showAllMember?: boolean
}

export interface SmartFilterState extends SmartBusinessState {
  options: SmartFilterDataOptions
}

export class SmartFilterService<State extends SmartFilterState = SmartFilterState> extends SmartBusinessService<
  IDimensionMember,
  State
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
      const hierarchy = getEntityHierarchy(this.entityType, this.dimension)
      let results: IDimensionMember[]
      if (!showAllMember && hierarchy?.allMember) {
        results = data.filter((item) => item.memberKey !== hierarchy.allMember)
      } else {
        results = data
      }
      return uniqBy<IMember>(
        results.map((item) => ({
          value: item.memberKey,
          label: item.memberCaption
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
      return this.entityService.getMembers<IDimensionMember>(this.dimension).pipe(
        map((data) => ({
          data,
          schema: {
            columns: [
              {
                name: 'memberKey',
                label: 'Member Key',
                type: 'string'
              },
              {
                name: 'memberCaption',
                label: 'Member Caption',
                type: 'string'
              }
            ],
            recursiveHierarchy: DimensionMemberRecursiveHierarchy
          }
        }))
      )
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

    const propertyName = getPropertyHierarchy(dimension)

    return super.query(options).pipe(
      map((result) => {
        const valueProperty = dimension.hierarchy || dimension.dimension
        const captionProperty = dimension.caption
        const data = result.data.map((item) => ({
          ...dimension,
          memberKey: item[valueProperty],
          memberCaption: item[captionProperty],
          parentKey: `[${propertyName}].[PARENT_UNIQUE_NAME]`
        }))

        return {
          data,
          schema: {
            columns: [
              {
                name: 'memberKey',
                label: 'Member Key',
                type: 'string'
              },
              {
                name: 'memberCaption',
                label: 'Member Caption',
                type: 'string'
              }
            ],
            recursiveHierarchy: DimensionMemberRecursiveHierarchy
          }
        }
      })
    )
  }
}
