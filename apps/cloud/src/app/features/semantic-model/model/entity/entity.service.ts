import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { DestroyRef, Injectable, OnDestroy, inject } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import {
  AggregationRole,
  C_MEASURES,
  CalculatedMember,
  Cube,
  DimensionUsage,
  EntityProperty,
  EntityType,
  Property,
  PropertyAttributes,
  PropertyDimension,
  PropertyHierarchy,
  PropertyLevel,
  PropertyMeasure,
  Table,
  getHierarchyById,
  getLevelById
} from '@metad/ocap-core'
import { ComponentSubStore, DirtyCheckQuery } from '@metad/store'
import { NxSettingsPanelService } from '@metad/story/designer'
import { uuid } from 'apps/cloud/src/app/@core'
import { assign, isEqual, omit, omitBy } from 'lodash-es'
import {
  Observable,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  of,
  pluck,
  shareReplay,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs'
import { SemanticModelService } from '../model.service'
import { EntityPreview, MODEL_TYPE, ModelCubeState, ModelDesignerType, PACModelState } from '../types'
import { newDimensionFromColumn } from './types'

@Injectable()
export class ModelEntityService extends ComponentSubStore<ModelCubeState, PACModelState> implements OnDestroy {
  private _router = inject(Router)
  private _route = inject(ActivatedRoute)
  private destroyRef = inject(DestroyRef)

  get preview() {
    return this.get((state) => state.preview)
  }

  _statement = toSignal(this.select((state) => state.queryLab?.statement))
  set statement(value) {
    this.patchState({ queryLab: {statement: value} })
  }

  readonly dirtyCheckQuery: DirtyCheckQuery = new DirtyCheckQuery(this, {
    watchProperty: ['entityType', 'cube'],
    clean: (head, current) => {
      return of(true)
    }
  })
  public readonly dirty$ = this.dirtyCheckQuery.isDirty$
  public readonly entityName$ = this.select((state) => state.name).pipe(filter(Boolean))
  public readonly cube$ = this.select((state) => state.cube)
  public readonly tables$ = this.cube$.pipe(map((cube) => cube?.tables))
  public readonly entityType$ = this.entityName$.pipe(
    switchMap((name) => this.modelService.selectEntityType(name)),
    takeUntilDestroyed(),
    shareReplay(1)
  )
  public readonly entityType = toSignal(this.entityType$)

  public readonly originalEntityType$ = this.entityName$.pipe(
    switchMap((name) => this.modelService.selectOriginalEntityType(name)),
    takeUntilDestroyed(),
    shareReplay(1)
  )

  public readonly dimensionUsages$ = this.cube$.pipe(pluck('dimensionUsages'))
  public readonly cubeDimensions$ = this.cube$.pipe(pluck('dimensions'))
  public readonly measures$ = this.cube$.pipe(pluck('measures'))
  public readonly calculatedMembers$ = this.cube$.pipe(map((x) => x?.calculatedMembers))

  /**
  |--------------------------------------------------------------------------
  | Signals
  |--------------------------------------------------------------------------
  */
  public readonly currentCalculatedMember = toSignal(this.select((state) => state.cube?.calculatedMembers?.find((item) => item.__id__ === state.currentCalculatedMember)))

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effect)
  |--------------------------------------------------------------------------
  */
  private _cubeSub = this.cube$.pipe(filter(Boolean), takeUntilDestroyed()).subscribe((cube) => {
    this.modelService.updateDataSourceSchemaCube(cube)
  })
  private _entityTypeSub = this.select((state) => state.entityType)
    .pipe(filter(Boolean), takeUntilDestroyed())
    .subscribe((cube) => {
      this.modelService.updateDataSourceSchemaEntityType(cube)
    })

  constructor(public modelService: SemanticModelService, public settingsService: NxSettingsPanelService) {
    super({} as ModelCubeState)
  }

  public init(entity: string) {
    this.connect(this.modelService, { parent: ['cubes', entity] })
    this.dirtyCheckQuery.setHead()
    this.modelService.saved$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.dirtyCheckQuery.setHead()
    })

    this.dirtyCheckQuery.isDirty$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((dirty) => {
      if (!this.get((state) => state.dirty)) {
        this.patchState({ dirty })
      }
    })
  }

  query(statement: string) {
    return this.modelService.dataSource.query({ statement })
  }

  readonly updateCube = this.updater((state, cube: Partial<Cube>) => {
    state.cube = {
      ...state.cube,
      ...cube
    }
  })

  readonly setExpression = this.updater((state, expression: string) => {
    state.cube.expression = expression
  })

  readonly addCubeTable = this.updater((state, table: Table) => {
    table.__id__ = table.__id__ ?? uuid()
    state.cube.tables = state.cube.tables ?? []
    state.cube.tables.push(table)
  })

  readonly removeCubeTable = this.updater((state, table: Table) => {
    // 有的情况下 table.__id__ 会为空，这时候就用 name 去删除
    const index = state.cube.tables?.findIndex((item) =>
      item.__id__ ? item.__id__ === table.__id__ : item.name === table.name
    )
    if (index > -1) {
      state.cube.tables.splice(index, 1)
    }
  })

  readonly changeTableJoinType = this.updater(
    (state, { table, type }: { table: Table; type: Table['join']['type'] }) => {
      const _table = findTableById(state, table.__id__)
      _table.join.type = type
    }
  )

  readonly addCubeTableJoin = this.updater((state, table: Table) => {
    const _table = findTableById(state, table.__id__)
    _table.join.fields = _table.join.fields ?? []
    _table.join.fields.push({
      leftKey: null,
      rightKey: null
    })
  })

  readonly removeJoinField = this.updater((state, { table, index }: { table: Table; index: number }) => {
    const _table = findTableById(state, table.__id__)
    _table.join.fields.splice(index, 1)
  })

  readonly changeJoinLeftKey = this.updater(
    (state, { table, index, key }: { table: Table; index: number; key: string }) => {
      const _table = findTableById(state, table.__id__)
      _table.join.fields[index].leftKey = key
    }
  )

  readonly changeJoinRightKey = this.updater(
    (state, { table, index, key }: { table: Table; index: number; key: string }) => {
      const _table = findTableById(state, table.__id__)
      _table.join.fields[index].rightKey = key
    }
  )

  /**
   * 通过 ID 更新 EntityType 单个 property
   */
  readonly updateEntityProperty = this.updater((state, { id, property }: { id: string; property: Property }) => {
    state.entityType = state.entityType || { name: state.name, visible: true, properties: {} }
    // step 1. 通过 id 查找
    const keyValue = Object.entries(state.entityType.properties).find(([key, value]) => value.__id__ === id)
    if (keyValue) {
      delete state.entityType.properties[keyValue[0]]
      state.entityType.properties[property.name] = {
        ...keyValue[1],
        ...property,
        __id__: id
      }
    } else {
      state.entityType.properties[property.name] = {
        ...property,
        __id__: id
      }
    }
  })

  // Crud for dimension measure and calculated measure
  /**
   * New dimension
   * * blank
   * * from source table column
   */
  readonly newDimension = this.updater((state, event?: { index: number; column: PropertyAttributes }) => {
    state.cube.dimensions = state.cube.dimensions ?? []
    if (event) {
      state.cube.dimensions.splice(event.index, 0, newDimensionFromColumn(event.column))
    } else if (!state.cube.dimensions.find((item) => item.name === '')) {
      state.cube.dimensions.push({
        __id__: uuid(),
        name: ''
      } as PropertyDimension)
    }
  })

  readonly addDimension = this.updater((state, dimension: PropertyDimension) => {
    state.cube.dimensions = state.cube.dimensions ?? []
    state.cube.dimensions.push({
      __id__: uuid(),
      ...dimension
    } as PropertyDimension)
  })

  readonly newDimensionUsage = this.updater((state, { index, usage }: { index: number; usage: DimensionUsage }) => {
    state.cube.dimensionUsages = state.cube.dimensionUsages ?? []
    state.cube.dimensionUsages.splice(Math.min(index, state.cube.dimensionUsages.length), 0, {
      ...usage,
      __id__: uuid()
    })
  })

  readonly newHierarchy = this.updater((state, { id, name }: { id: string; name: string }) => {
    const dimension = state.cube.dimensions.find((item) => item.__id__ === id)
    dimension.hierarchies = dimension.hierarchies ?? []
    dimension.hierarchies.push({
      __id__: uuid(),
      name
    } as PropertyHierarchy)
  })

  readonly newLevel = this.updater((state, { id, name }: { id: string; name: string }) => {
    const hierarchy = getHierarchyById(state.cube, id)
    // 检查是否已经存在新建条目
    if (!hierarchy.levels?.find((item) => item.name === name)) {
      hierarchy.levels = hierarchy.levels ?? []
      hierarchy.levels.push({
        __id__: uuid(),
        name
      } as PropertyLevel)
    }
  })

  readonly newMeasure = this.updater((state, event?: { index: number; column?: string }) => {
    state.cube.measures = state.cube.measures ?? []
    if (event) {
      state.cube.measures.splice(event.index, 0, {
        __id__: uuid(),
        name: event.column,
        column: event.column,
        aggregator: 'sum',
        visible: true
      })
    } else if (!state.cube.measures.find((item) => item.name === '')) {
      state.cube.measures.push({
        __id__: uuid(),
        name: '',
        aggregator: 'sum',
        visible: true
      } as PropertyMeasure)
    }
  })

  readonly moveItemInMeasures = this.updater((state, event: CdkDragDrop<any[]>) => {
    moveItemInArray(state.cube.measures, event.previousIndex, event.currentIndex)
  })

  /**
   * Create a new calculated measure using column of table
   */
  readonly newCalculatedMeasure = this.updater((state, event?: { index: number; column?: string }) => {
    state.cube.calculatedMembers = state.cube.calculatedMembers ?? []
    if (event) {
      // 拖拽来的表字段
      state.cube.calculatedMembers.splice(event.index, 0, {
        __id__: uuid(),
        name: event.column,
        formula: event.column,
        aggregator: 'sum'
      })
    } else if (!state.cube.calculatedMembers.find((item) => item.name === '')) {
      // 插入到第一个
      state.cube.calculatedMembers.splice(0, 0, {
        __id__: uuid(),
        name: '',
        dimension: C_MEASURES,
        formula: null
      })
    }
  })

  readonly addCalculatedMeasure = this.updater((state, calculatedMember: Partial<CalculatedMember>) => {
    state.cube.calculatedMembers = state.cube.calculatedMembers ?? []
    state.cube.calculatedMembers.push({
      ...calculatedMember,
      __id__: calculatedMember.__id__ ?? uuid()
    } as CalculatedMember)
  })

  readonly deleteDimensionUsage = this.updater((state, id: string) => {
    const index = state.cube.dimensionUsages.findIndex((item) => item.__id__ === id)
    if (index > -1) {
      state.cube.dimensionUsages.splice(index, 1)
    }
  })

  /**
   * 删除维度及维度下的字段
   */
  readonly deleteDimensionProperty = this.updater((state, id: string) => {
    let parent = null
    let index = null

    state.cube.dimensionUsages?.find((usage, i) => {
      if (usage.__id__ === id) {
        parent = state.cube.dimensionUsages
        index = i
        return true
      }
      return false
    })

    if (!parent) {
      state.cube.dimensions?.find((dim, i) => {
        if (dim.__id__ === id) {
          parent = state.cube.dimensions
          index = i
          return true
        }

        return !!dim.hierarchies?.find((hier, j) => {
          if (hier.__id__ === id) {
            parent = dim.hierarchies
            index = j
            return true
          }

          return !!hier.levels?.find((level, k) => {
            if (level.__id__ === id) {
              parent = hier.levels
              index = k
              return true
            }
            return false
          })
        })
      })
    }

    if (parent) {
      parent.splice(index, 1)
    }
  })

  readonly deleteMeasure = this.updater((state, id: string) => {
    const index = state.cube.measures.findIndex((item) => item.__id__ === id)
    if (index > -1) {
      state.cube.measures.splice(index, 1)
    }
  })

  readonly deleteCalculatedMember = this.updater((state, id: string) => {
    const index = state.cube.calculatedMembers.findIndex((item) => item.__id__ === id)
    if (index > -1) {
      state.cube.calculatedMembers.splice(index, 1)
    }
  })

  // 调整元素之间的顺序方法们
  readonly moveItemInCalculatedMember = this.updater((state, event: CdkDragDrop<Partial<CalculatedMember>[]>) => {
    moveItemInArray(state.cube.calculatedMembers, event.previousIndex, event.currentIndex)
  })
  readonly moveItemInDimensions = this.updater((state, event: CdkDragDrop<CalculatedMember[]>) => {
    if (
      !event.item.data.isUsage &&
      (event.item.data.role === AggregationRole.level || event.item.data.role === AggregationRole.hierarchy)
    ) {
      const dimension = state.cube.dimensions?.find((dimension) => dimension.name === event.item.data.dimension)
      if (dimension) {
        if (event.item.data.role === AggregationRole.level) {
          // Level
          const hierarchy = dimension.hierarchies.find((hierarchy) => hierarchy.name === event.item.data.hierarchy)
          const fromIndex = hierarchy.levels.findIndex((item) => item.__id__ === event.item.data.__id__)
          moveItemInArray(
            hierarchy.levels,
            fromIndex,
            Math.max(Math.min(fromIndex + event.currentIndex - event.previousIndex, hierarchy.levels.length - 1), 0)
          )
        } else {
          // Hierarchy
          const fromIndex = dimension.hierarchies.findIndex((item) => item.__id__ === event.item.data.__id__)
          moveItemInArray(
            dimension.hierarchies,
            fromIndex,
            Math.max(
              Math.min(fromIndex + event.currentIndex - event.previousIndex, dimension.hierarchies.length - 1),
              0
            )
          )
        }
      }
    } else if (event.item.data.role === AggregationRole.dimension) {
      // Dimension or Dimension Usage
      if (event.item.data.isUsage) {
        // Dimension Usage
        const fromIndex = state.cube.dimensionUsages.findIndex((usage) => usage.__id__ === event.item.data.__id__)
        moveItemInArray(
          state.cube.dimensionUsages,
          fromIndex,
          Math.max(
            Math.min(fromIndex + event.currentIndex - event.previousIndex, state.cube.dimensionUsages.length - 1),
            0
          )
        )
      } else {
        // Dimension
        const fromIndex = state.cube.dimensions.findIndex((usage) => usage.__id__ === event.item.data.__id__)
        moveItemInArray(
          state.cube.dimensions,
          fromIndex,
          Math.max(Math.min(fromIndex + event.currentIndex - event.previousIndex, state.cube.dimensions.length - 1), 0)
        )
      }
    }
  })

  /**
   * Set selected property name to open designer panel
   */
  readonly setSelectedProperty = this.effect((origin$: Observable<string>) => {
    return origin$.pipe(
      withLatestFrom(this.state$, this.modelService.modelType$),
      switchMap(([typeAndId, state, modelType]) => {
        const [type, id] = typeAndId?.split('#') ?? [ModelDesignerType.cube, state.cube.__id__]

        return this.settingsService
          .openDesigner(
            ModelDesignerType[type] + (modelType === MODEL_TYPE.XMLA ? 'Attributes' : ''),
            combineLatest([
              this.cube$,
              this.selectByTypeAndId(ModelDesignerType[type], id).pipe(
                filter(Boolean) // 过滤已经被删除的等情况
              )
            ]).pipe(
              map(([cube, modeling]) => ({
                cube,
                id: modeling.__id__,
                modeling
              })),
              distinctUntilChanged(isEqual)
            ),
            id
          )
          .pipe(
            distinctUntilChanged(isEqual),
            tap((result) =>
              this.updateCubeProperty({
                id,
                type: ModelDesignerType[type],
                model: result.modeling
              })
            )
          )
      })
    )
  })

  selectCalculatedMember<T>(id: string): Observable<CalculatedMember> {
    return this.selectByTypeAndId(ModelDesignerType.calculatedMember, id)
  }
  setCalculatedMember(member: CalculatedMember) {
    this.updateCubeProperty({ id: member.__id__, type: ModelDesignerType.calculatedMember, model: member })
  }

  selectDimension(id: string) {
    return this.cubeDimensions$.pipe(map((dimensions) => dimensions?.find((item) => item.__id__ === id)))
  }

  selectByTypeAndId<T>(type: ModelDesignerType, id: string): Observable<any> {
    return this.cube$.pipe(
      map((cube) => {
        if (type === ModelDesignerType.cube) {
          return cube
        }
        if (type === ModelDesignerType.dimensionUsage) {
          return cube.dimensionUsages.find((item) => item.__id__ === id)
        }

        if (type === ModelDesignerType.calculatedMember) {
          return cube.calculatedMembers?.find((item) => item.__id__ === id)
        }
        if (type === ModelDesignerType.dimension) {
          let dim = cube.dimensions?.find((item) => item.__id__ === id)
          if (dim) {
            return omit(dim, ['hierarchies'])
          }
        }
        if (type === ModelDesignerType.hierarchy) {
          const hierarchy = getHierarchyById(cube, id)
          return omit(hierarchy, ['levels'])
        }
        if (type === ModelDesignerType.level) {
          return getLevelById(cube, id) ?? { __id__: id }
        }

        if (type === ModelDesignerType.measure) {
          return cube.measures?.find((item) => item.__id__ === id)
        }

        return null
      })
    )
  }

  readonly updateCubeProperty = this.updater(
    (state, { id, type, model }: { id: string; type: ModelDesignerType; model: any }) => {
      if (type === ModelDesignerType.cube) {
        assign(state.cube, omitBy(model, ['__id__', 'name']))
      }

      if (type === ModelDesignerType.dimensionUsage) {
        const index = state.cube.dimensionUsages.findIndex((item) => item.__id__ === id)
        state.cube.dimensionUsages[index] = {
          ...state.cube.dimensionUsages[index],
          ...model
        }
      }
      if (type === ModelDesignerType.calculatedMember) {
        const index = state.cube.calculatedMembers.findIndex((item) => item.__id__ === id)
        state.cube.calculatedMembers[index] = {
          ...state.cube.calculatedMembers[index],
          ...model
        }
      }
      if (type === ModelDesignerType.dimension) {
        state.cube.dimensions = state.cube.dimensions ?? []
        const index = state.cube.dimensions.findIndex((item) => item.__id__ === id)
        if (index > -1) {
          state.cube.dimensions[index] = {
            ...state.cube.dimensions[index],
            ...model
          }
        } else {
          state.cube.dimensions.push({
            ...model,
            __id__: id
          })
        }
      }
      if (type === ModelDesignerType.hierarchy) {
        const hierarchy = getHierarchyById(state.cube, id)
        assign(hierarchy, model)
      }
      if (type === ModelDesignerType.level) {
        const level = getLevelById(state.cube, id)
        assign(level, model)
      }

      if (type === ModelDesignerType.measure) {
        const index = state.cube.measures?.findIndex((item) => item.__id__ === id)
        if (index > -1) {
          state.cube.measures[index] = {
            ...state.cube.measures[index],
            ...model
          }
        } else {
          state.cube.measures = state.cube.measures ?? []
          state.cube.measures.push({
            ...model,
            __id__: uuid()
          })
        }
      }
    }
  )

  readonly navigateDimension = this.effect((origin$: Observable<string>) => {
    return origin$.pipe(
      withLatestFrom(this.dimensionUsages$),
      tap(([id, dimensionUsages]) => {
        this.modelService.navigateDimension(dimensionUsages?.find((item) => item.__id__ === id)?.source)
      })
    )
  })

  navigateCalculation(key: string) {
    this._router.navigate(['calculation', key], { relativeTo: this._route })
  }

  readonly setPreview = this.updater((state, preview: EntityPreview) => {
    state.preview = preview
  })

  ngOnDestroy(): void {
    this.destroySubject$.next()
    this.destroySubject$.complete()
  }
}

function findTableById(state, id) {
  return state.cube.tables.find(({ __id__ }) => __id__ === id)
}

/**
 * 验证维度定义信息相对于运行时信息是否合法
 *
 * @param dimension
 * @param rtDimensions
 */
function validateDimension(dimension: PropertyDimension, rtDimensions: PropertyDimension[]) {
  return !rtDimensions.find((item) => item.name === dimension.name || item.name === dimension.column)
    ? `Can't found column for dimension '${dimension.name}'`
    : null
}

export function getEntityPropertyById(entityType: EntityType, id: string): EntityProperty {
  return Object.values(entityType?.properties ?? {}).reduce(
    (prev, dimension) =>
      prev ??
      (dimension.__id__ === id
        ? dimension
        : dimension.hierarchies?.reduce(
            (prev, hierarchy) =>
              prev ??
              (hierarchy.__id__ === id
                ? hierarchy
                : hierarchy.levels?.reduce((prev, level) => prev ?? (level.__id__ === id ? level : null), null)),
            null
          )),
    null
  )
}
