import { CdkDropList, DropListRef, moveItemInArray } from '@angular/cdk/drag-drop'
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core'
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { ModelsService, NgmSemanticModel, convertNewSemanticModelResult } from '@metad/cloud/state'
import { nonNullable } from '@metad/core'
import { NgmDSCoreService, effectAction } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import {
  AgentType,
  Cube,
  DBTable,
  DataSource,
  Dimension,
  EntityType,
  PropertyDimension,
  Schema,
  TableEntity,
  isEntitySet,
  isEntityType,
  omit,
  wrapHierarchyValue
} from '@metad/ocap-core'
import { getSemanticModelKey } from '@metad/story/core'
import { Store, createStore, select, withProps } from '@ngneat/elf'
import { stateHistory } from '@ngneat/elf-state-history'
import { cloneDeep, isEqual, negate } from 'lodash-es'
import { NGXLogger } from 'ngx-logger'
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs'
import { combineLatestWith, distinctUntilChanged, filter, map, shareReplay, switchMap, take, tap } from 'rxjs/operators'
import { ISemanticModel, MDX, ToastrService, getSQLSourceName, getXmlaSourceName, registerModel, uid10, uuid } from '../../../@core'
import { dirtyCheckWith, write } from '../store'
import {
  MODEL_TYPE,
  ModelCubeState,
  ModelDimensionState,
  ModelQueryState,
  SemanticModelEntity,
  SemanticModelEntityType,
  SemanticModelState,
  initDimensionSubState,
  initEntitySubState
} from './types'
import { CreateEntityDialogRetType } from './create-entity/create-entity.component'

@Injectable()
export class SemanticModelService {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly destroyRef = inject(DestroyRef)
  private readonly logger = inject(NGXLogger)
  readonly #toastr = inject(ToastrService)

  /**
  |--------------------------------------------------------------------------
  | Store
  |--------------------------------------------------------------------------
  */
  readonly store = createStore({ name: 'semantic_model' }, withProps<SemanticModelState>({model: null}))
  readonly pristineStore = createStore({ name: 'semantic_model_pristine' }, withProps<SemanticModelState>({model: null}))
  readonly #stateHistory = stateHistory<Store, SemanticModelState>(this.store, {
    comparatorFn: negate(isEqual)
  })
  /**
   * Dirty check for whole model
   */
  readonly dirtyCheckResult = dirtyCheckWith(this.store, this.pristineStore, { comparator: negate(isEqual )})
  /**
   * Dirty for every entity
   */
  readonly dirty = signal<Record<string, boolean>>({})
  readonly stories = signal([])
  readonly model$ = this.store.pipe(select((state) => state.model), filter(nonNullable))
  readonly cubeStates$ = this.model$.pipe(map(initEntitySubState))
  readonly dimensionStates$ = this.model$.pipe(map(initDimensionSubState))
  readonly modelSignal = toSignal(this.model$)
  readonly dimensions = computed(() => this.modelSignal()?.schema?.dimensions ?? [])
  readonly cubes = computed(() => this.modelSignal()?.schema?.cubes ?? [])

  readonly schema$ = this.model$.pipe(
    select((state) => state?.schema),
    filter(nonNullable)
  )
  readonly cubes$ = this.schema$.pipe(select((state) => state.cubes))
  readonly dimensions$ = this.schema$.pipe(select((state) => state.dimensions))
  readonly virtualCubes$ = this.schema$.pipe(select((schema) => schema.virtualCubes))

  readonly modelId$ = this.model$.pipe(map((model) => model?.id))
  readonly dialect$ = this.model$.pipe(map((model) => model?.dataSource?.type?.type))
  readonly isLocalAgent$ = this.model$.pipe(map((model) => model?.dataSource?.type?.type === 'agent'))

  readonly tables = computed(() => this.modelSignal()?.tables)

  readonly viewEditor = signal({ wordWrap: false })
  readonly currentEntity = signal<string | null>(null)

  /**
  |--------------------------------------------------------------------------
  | Observables
  |--------------------------------------------------------------------------
  */
  public readonly tables$ = this.model$.pipe(map((model) => model?.tables))
  public readonly sharedDimensions$ = this.dimensionStates$.pipe(
    map((states) => states?.map((state) => state.dimension))
  )
  public readonly entities$: Observable<SemanticModelEntity[]> = combineLatest([
    this.cubeStates$,
    this.dimensionStates$
  ]).pipe(
    map(([cubes, dimensions]) => {
      return [
        ...(cubes?.map((cube) => ({ ...cube, caption: (cube.cube as any)?.caption })) ?? []),
        ...(dimensions?.map((dimension) => ({ ...dimension, caption: dimension.dimension?.caption })) ?? [])
      ]
    }),
    takeUntilDestroyed(),
    shareReplay(1)
  )

  public readonly modelType$ = this.model$.pipe(
    map((model) => {
      if (model.type === 'XMLA') {
        if (model.dataSource.type.protocol?.toUpperCase() !== 'XMLA') {
          return MODEL_TYPE.OLAP
        } else {
          return MODEL_TYPE.XMLA
        }
      }
      // todo 其他情况
      return MODEL_TYPE.SQL
    }),
    distinctUntilChanged()
  )

  public readonly isWasm$ = this.model$.pipe(map((model) => model?.agentType === AgentType.Wasm))
  public readonly isXmla$ = this.model$.pipe(map((model) => model?.type === 'XMLA'))
  public readonly isOlap$ = this.modelType$.pipe(map((modelType) => modelType === MODEL_TYPE.OLAP))
  public readonly isSQLSource$ = this.model$.pipe(
    map((model) => model.dataSource?.type?.protocol?.toUpperCase() === 'SQL' || model?.agentType === AgentType.Wasm)
  )

  public readonly wordWrap$ = toObservable(this.viewEditor).pipe(map((editor) => editor.wordWrap))

  public readonly currentCube$ = combineLatest([toObservable(this.currentEntity), this.cubeStates$]).pipe(
    map(([current, cubeStates]) => cubeStates?.find((item) => item.id === current)?.cube),
    takeUntilDestroyed(),
    shareReplay(1)
  )
  public readonly currentDimension$ = combineLatest([toObservable(this.currentEntity), this.dimensionStates$]).pipe(
    map(([current, dimensionStates]) => dimensionStates?.find((item) => item.id === current)?.dimension),
    takeUntilDestroyed(),
    shareReplay(1)
  )

  public readonly currentEntityType$ = combineLatest([toObservable(this.currentEntity), this.entities$]).pipe(
    map(([currentEntity, entities]) => entities?.find((item) => item.id === currentEntity)?.type),
    takeUntilDestroyed(),
    shareReplay(1)
  )

  // Model Roles
  public readonly stories$ = toObservable(this.stories)
  public readonly roles$ = this.model$.pipe(
    combineLatestWith(this.isOlap$.pipe(filter((isOlap) => isOlap))),
    map(([model, isOlap]) => model?.roles)
  )
  public readonly indicators$ = this.model$.pipe(map((model) => model.indicators))

  readonly semanticModelKey$ = this.model$.pipe(filter(nonNullable), map(getSemanticModelKey), filter(nonNullable), distinctUntilChanged())

  readonly dataSource$ = new BehaviorSubject<DataSource>(null)

  /**
   * Original data source:
   * * MDX Model 中用于直接计算数据库信息
   * * SQL Model 中同 dataSource 相等
   */
  private originalDataSource$ = new BehaviorSubject<DataSource>(null)
  public get originalDataSource() {
    return this.originalDataSource$.value
  }

  public readonly entitySets$ = this.dataSource$.pipe(
    filter(nonNullable),
    switchMap((dataSource) => dataSource.selectEntitySets()),
    takeUntilDestroyed(),
    shareReplay(1)
  )

  // public readonly selectDBTables$: Observable<DBTable[]> = this.originalDataSource$.pipe(
  //   filter(nonNullable),
  //   switchMap((dataSource) => dataSource.discoverDBTables())
  // )

  // private _saved$ = new Subject<void>()
  // public readonly saved$ = this._saved$.asObservable()
  public readonly dragReleased$ = new Subject<DropListRef<CdkDropList<any>>>()

  /**
  |--------------------------------------------------------------------------
  | Signals
  |--------------------------------------------------------------------------
  */
  readonly modelType = toSignal(this.modelType$)
  readonly isDirty = this.dirtyCheckResult.dirty

  constructor(
    private modelsService: ModelsService,
    private dsCoreService: NgmDSCoreService,
    private wasmAgent: WasmAgentService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {
    // Pause state history until model is loaded
    // this.#stateHistory.pause()

    // TODO 一个状态改变产生另一个状态, 这种需求应该怎么处理??
    // this.entities$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((entities) => {
    //   this.patchState({ ids: entities?.map((state) => state.id) })
    // })

    this.semanticModelKey$
      .pipe(
        filter(nonNullable),
        switchMap((key) => this.dsCoreService.getDataSource(key)),
        // 先清 DataSource 缓存再进行后续
        // switchMap((dataSource) => from(dataSource?.clearCache() ?? [true]).pipe(map(() => dataSource))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(this.dataSource$)

    this.model$
      .pipe(
        filter(nonNullable),
        filter((model) => nonNullable(model.key)),
        distinctUntilChanged((a, b) => a.key === b.key),
        switchMap((model) => {
          const modelKey = getSemanticModelKey(model)
          if (model.type === 'XMLA') {
            if (model.dataSource?.type?.protocol?.toUpperCase() === 'SQL') {
              return this.dsCoreService.getDataSource(getSQLSourceName(modelKey))
            } else {
              return this.dsCoreService.getDataSource(getXmlaSourceName(modelKey))
            }
          }
          return this.dsCoreService.getDataSource(modelKey)
        }),
        // 先清 DataSource 缓存再进行后续
        // switchMap((dataSource) => from(dataSource?.clearCache() ?? [true]).pipe(map(() => dataSource))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(this.originalDataSource$)

    // @todo 存在不必要的注册动作，需要重构
    this.model$.pipe(filter(nonNullable), takeUntilDestroyed(this.destroyRef)).subscribe((model) => {
      this.registerModel()
    })

    // this.dataSource$.pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef)).subscribe((dataSource) => {
    //   dataSource?.clearCache()
    // })
  }

  initModel(model: ISemanticModel) {
    // New store
    this.stories.set(model.stories)
    const semanticModel = convertNewSemanticModelResult(model)
    this.store.update(() => ({model: semanticModel}))
    this.pristineStore.update(() => ({model: cloneDeep(semanticModel)}))
    // Resume state history after model is loaded
    // this.#stateHistory.resume()
  }

  undo() {
    this.#stateHistory.undo()
  }

  redo() {
    this.#stateHistory.redo()
  }

  updater<ProvidedType = void, OriginType = ProvidedType>(
    fn: (state: NgmSemanticModel, ...params: OriginType[]) => NgmSemanticModel | void
  ) {
    return (...params: OriginType[]) => {
      this.store.update(write((state) => {
        const model = fn(state.model, ...params)
        if (model) {
          state.model = model
        }
        return state
      }))
    }
  }

  /**
   * Register current model into ocap framwork
   */
  registerModel() {
    const model = this.modelSignal()
    this.logger.debug(`Model changed => call registerModel`, getSemanticModelKey(model))
    // Not contain indicators when building model
    registerModel(omit(model, 'indicators'), this.dsCoreService, this.wasmAgent)
  }

  saveModel = effectAction((origin$: Observable<void>) => {
    return origin$.pipe(
      map(() => {
        const model = cloneDeep(this.modelSignal())
        // Update index of roles
        model.roles = model.roles.map((role, index) => ({ ...role, index }))
        return model
      }),
      switchMap((model) =>
        this.#toastr
          .update({ code: 'PAC.MODEL.MODEL.TITLE', params: { Default: 'Semantic Model' } }, () => {
            return this.modelsService.update(model.id, model, { relations: ['roles', 'roles.users'] })
          })
          .pipe(
            tap((model) => {
              // this.updateModel({roles: sortBy(model.roles, 'index')})
              // this._saved$.next()
              this.resetPristine()
              this.dataSource$.value?.clearCache()
              // Register model after saved to refresh metadata of entity
              this.registerModel()
            })
          )
      )
    )
  })

  /**
   * 语义模型保存
   *
   */
  // _saveModel() {
  //   this.rollupEntities()
  //   const model = cloneDeep(this.get((state) => state.model))
  //   model.roles = model.roles.map((role, index) => ({...role, index}))
  // }

  /**
   * 收集子状态中需要保存的数据
   */
  // readonly rollupEntities = this.updater((state) => {
  //   state.schema = (state.schema || { name: state.name }) as Schema
  //   state.schema.dimensions = state.dimensions
  //     .map((dimensionState) => dimensionState.dimension)
  //     .filter((cube) => !!cube)
  //   state.schema.cubes = state.cubes.map((entityState) => entityState.cube).filter((cube) => !!cube)
  // })

  /**
   * 初始化 Semantic Model UI State 和子状态
   */
  // private readonly _setModel = this.updater((state, model: NgmSemanticModel) => {
  //   state.activedEntities = []
  //   state.model = model
  //   state.roles = sortBy(state.roles, 'index')
  //   state.cubes = initEntitySubState(model)
  //   state.dimensions = initDimensionSubState(model)
  //   if (state.currentEntity) {
  //     const entity = [...state.cubes, ...state.dimensions].find((entity) => entity.id === state.currentEntity)
  //     if (entity) {
  //       state.activedEntities.push(entity)
  //     }
  //   }
  // })

  resetPristine() {
    this.pristineStore.update(() => ({model: cloneDeep(this.modelSignal())}))
  }

  setCrrentEntity(id: string) {
    this.currentEntity.set(id)
  }

  // private readonly _resetDirty = this.updater((state) => {
  //   state.dimensions.forEach((dimension) => (dimension.dirty = false))
  //   state.cubes.forEach((cube) => (cube.dirty = false))
  // })

  /**
   * 激活(打开) Entity
   */
  // readonly setCrrentEntity = this.updater((state, id: string) => {
  //   let entity = state.activedEntities?.find((entity) => entity.id === id)
  //   if (!entity) {
  //     entity = state.cubes?.find((entity) => entity.id === id)
  //     if (!entity) {
  //       entity = state.dimensions?.find((entity) => entity.id === id)
  //     }
  //     if (entity) {
  //       state.activedEntities.push(entity)
  //     }
  //   }

  //   state.currentEntity = id
  // })

  readonly updateModel = this.updater((state, model: Partial<NgmSemanticModel>) => {
    return {
      ...state,
      ...model
    }
  })

  readonly addTable = this.updater((state, table: TableEntity) => {
    state.tables = state.tables ?? []
    const index = state.tables?.findIndex((item) => item.name === table.name)
    if (index > -1) {
      throw new Error(`Table name '${table.name}' exists!`)
    }
    state.tables.push(table)
  })
  readonly editTable = this.updater((state, table: TableEntity) => {
    state.tables = state.tables ?? []
    const index = state.tables?.findIndex((item) => item.name === table.name)
    if (index > -1) {
      state.tables.splice(index, 1, table)
    } else {
      state.tables.push(table)
    }
  })
  readonly deleteTable = this.updater((state, name: string) => {
    const index = state.tables?.findIndex((item) => item.name === name)
    if (index > -1) {
      state.tables.splice(index, 1)
    }
  })

  /**
   * Create cube : Cube
   */
  createCube({ name, caption, table, expression, columns }: CreateEntityDialogRetType) {
    const id = uuid()
    const cube: Cube = {
      __id__: id,
      name: name,
      caption,
      tables: null,
      expression,
      defaultMeasure: null,
      visible: true,
      measures: [],
      dimensionUsages: [],
      dimensions: []
    }

    if (table) {
      cube.tables = [
        {
          name: table
        }
      ]
    }

    columns?.forEach((column) => {
      if (column.isMeasure) {
        cube.measures.push({
          __id__: uuid(),
          name: column.name,
          caption: column.caption,
          aggregator: column.aggregator || 'sum',
          visible: true,
          column: column.name
        })
      } else if (column.dimension) {
        cube.dimensionUsages.push({
          __id__: uuid(),
          name: column.dimension.name,
          caption: column.dimension.caption,
          foreignKey: column.name,
          source: column.dimension.name
        })
      } else if(column.isDimension) {
        cube.dimensions.push({
          __id__: uuid(),
          name: column.name,
          caption: column.caption,
          hierarchies: [
            {
              name: '',
              __id__: uuid(),
              hasAll: true,
              levels: [
                {
                  __id__: uuid(),
                  name: column.name,
                  caption: column.caption,
                  column: column.name
                }
              ]
            }
          ]
        })
      }
    })

    const state = {
      type: SemanticModelEntityType.CUBE,
      id,
      name,
      cube,
      queryLab: {},
      dirty: true
    } as ModelCubeState

    this.newCube(cube)
    return state
  }

  readonly createVirtualCube = this.updater((state, { id, name, caption, cubes }: CreateEntityDialogRetType & { id: string }) => {
    const schema = state.schema as Schema
    schema.virtualCubes ??= []
    schema.virtualCubes.push({
      __id__: id,
      name,
      caption,
      cubeUsages:
        cubes?.map((cube: Cube) => ({
          cubeName: cube.name,
          ignoreUnrelatedDimensions: true
        })) ?? []
    } as Partial<MDX.VirtualCube>)
  })

  createDimension({ name, caption, table, expression, primaryKey, columns }: CreateEntityDialogRetType) {
    const id = uuid()
    const dimension = {
      __id__: id,
      name: name,
      caption,
      expression,
      hierarchies: [
        {
          __id__: uuid(),
          caption,
          hasAll: true,
          primaryKey,
          tables: [
            {
              name: table
            }
          ],
          levels:
            columns?.map((column) => ({
              __id__: uuid(),
              name: column.name,
              caption: column.caption,
              column: column.name
            })) ?? []
        }
      ]
    } as PropertyDimension
    const state = {
      type: SemanticModelEntityType.DIMENSION,
      id,
      name: name,
      dimension,
      dirty: true
    } as ModelDimensionState

    this.newDimension(dimension)
    return state
  }

  // Actions for entity
  // readonly newEntity = this.updater((state, cube: ModelCubeState) => {
  //   state.cubes.push(cube)
  // })

  readonly newCube = this.updater((state, cube: Cube) => {
    state.schema ??= {} as Schema
    state.schema.cubes ??= []
    state.schema.cubes.push(cube)
  })

  readonly newDimension = this.updater((state, dimension: PropertyDimension) => {
    state.schema ??= {} as Schema
    state.schema.dimensions ??= []
    state.schema.dimensions.push(dimension)
  })

  /**
   * 删除实体数据: Cube, Dimension, VirtualCube
   */
  readonly deleteEntity = this.updater((state, id: string) => {
    state.schema.cubes = state.schema.cubes?.filter((item) => item.__id__ !== id)
    state.schema.dimensions = state.schema.dimensions?.filter((item) => item.__id__ !== id)
    state.schema.virtualCubes = state.schema.virtualCubes?.filter((item) => item.__id__ !== id)
  })

  readonly updateDimension = this.updater((state, dimension: PropertyDimension) => {
    const index = state.schema.dimensions.findIndex((item) => item.__id__ === dimension.__id__)
    if (index > -1) {
      state.schema.dimensions[index] = {
        ...state.schema.dimensions[index],
        ...dimension
      }
    }
  })

  readonly updateCube = this.updater((state, cube: Partial<Cube>) => {
    const index = state.schema.cubes.findIndex((item) => item.__id__ === cube.__id__)
    if (index > -1) {
      const _cube = state.schema.cubes[index]
      if (cube.dimensions) {
        _cube.dimensions = cube.dimensions.reduce((acc, dimension) => upsertItem(acc, dimension), _cube.dimensions ?? [])
      }
      if (cube.measures) {
        _cube.measures = cube.measures.reduce((acc, measure) => upsertItem(acc, measure), _cube.measures ?? [])
      }
      if (cube.calculatedMembers) {
        _cube.calculatedMembers = cube.calculatedMembers.reduce((acc, calculatedMember) => upsertItem(acc, calculatedMember), _cube.calculatedMembers ?? [])
      }
      if (cube.dimensionUsages) {
        _cube.dimensionUsages = cube.dimensionUsages.reduce((acc, dimensionUsage) => upsertItem(acc, dimensionUsage), _cube.dimensionUsages ?? [])
      }
      state.schema.cubes[index] = {
        ..._cube,
      }
    } else {
      throw new Error(`Cube key '${cube.__id__}' not found!`)
    }
  })

  /**
   * Update cube of schema in {@link DataSource}
   *
   * @param cube
   */
  updateDataSourceSchemaCube(cube: Cube) {
    this.dataSource$.value?.updateCube(cube)
    this.originalDataSource?.updateCube(cube)
  }

  /**
   * Update entityType of schema in {@link DataSource}
   *
   * @param entityType
   */
  updateDataSourceSchemaEntityType(entityType: EntityType) {
    this.dataSource$.value?.setEntityType(entityType)
  }

  /**
  |--------------------------------------------------------------------------
  | Selectors
  |--------------------------------------------------------------------------
  */

  selectDBTables(refresh = false) {
    return this.originalDataSource$.pipe(
      filter(nonNullable),
      take(1),
      switchMap((dataSource) => dataSource.discoverDBTables(refresh))
    )
  }

  selectEntitySet(cubeName: string) {
    return this.dataSource$.pipe(
      filter(nonNullable),
      switchMap((dataSource) => dataSource.selectEntitySet(cubeName))
    )
  }

  selectEntityType(cubeName: string): Observable<EntityType> {
    return this.selectEntitySet(cubeName).pipe(
      filter(isEntitySet),
      map(({ entityType }) => entityType)
    )
  }

  selectEntityProperties(table: string) {
    return this.selectEntityType(table).pipe(
      map((entityType) => {
        const properties = entityType?.properties
        if (properties) {
          return Object.values(properties)
        }
        return []
      })
    )
  }

  selectHierarchyMembers(entity: string, dimension: Dimension) {
    return this.dataSource$.pipe(
      filter(Boolean),
      switchMap((dataSource) => dataSource.selectMembers(entity, dimension)),
      takeUntilDestroyed(this.destroyRef)
    )
  }

  /**
   * Select error info for entity from origin db (Dimension or Cube in SQL Model)
   *
   * @param entity
   * @returns
   */
  selectOriginalEntityError(entity: string) {
    return this.originalDataSource$.pipe(
      filter(nonNullable),
      take(1),
      switchMap((dataSource) => dataSource.selectEntitySet(entity)),
      map((error) => (isEntitySet(error) ? null : error))
    )
  }

  selectOriginalEntityService(entityName: string) {
    return this.originalDataSource$.pipe(
      filter((dataSource) => !!dataSource),
      take(1),
      map((dataSource) => dataSource.createEntityService(entityName))
    )
  }

  private _originalEntityTypes = new Map<string, Observable<EntityType>>()
  /**
   * 获取原始表实体的类型定义 (针对如从 xmla 接口获取原始 Cube 信息的情况)
   *
   * @param entityName
   * @returns
   */
  selectOriginalEntityType(entity: string) {
    if (!this._originalEntityTypes.get(entity)) {
      this._originalEntityTypes.set(
        entity,
        this.originalDataSource$.pipe(
          filter(nonNullable),
          take(1),
          switchMap((dataSource) => dataSource.selectEntityType(entity).pipe(filter(isEntityType))),
          takeUntilDestroyed(this.destroyRef),
          shareReplay(1)
        )
      )
    }
    return this._originalEntityTypes.get(entity)
  }

  /**
   * 获取原始表实体的字段列表
   *
   * @param entityName
   * @returns
   */
  selectOriginalEntityProperties(entityName: string) {
    return this.selectOriginalEntityType(entityName).pipe(
      map((entityType) => {
        const properties = entityType?.properties
        if (properties) {
          return Object.values(properties)
        }
        return []
      })
    )
  }

  selectOriginalMembers(entity: string, dimension: Dimension) {
    return this.originalDataSource$.pipe(
      filter(nonNullable),
      take(1),
      switchMap((dataSource) => dataSource.selectMembers(entity, dimension)),
      map((members) =>
        members.map((member) => ({
          ...member,
          memberKey: wrapHierarchyValue(dimension.hierarchy, member.memberKey)
        }))
      ),
      takeUntilDestroyed(this.destroyRef)
    )
  }

  selectTableSamples(table: string, k: number = 10) {
    return this.originalDataSource$.pipe(
      filter(nonNullable),
      take(1),
      switchMap((dataSource) => dataSource.query({ statement: `SELECT * FROM ${table} LIMIT ${k}`, forceRefresh: true }))
    )
  }

  navigateDimension(name: string) {
    const dimensions = this.dimensions()
    const dimension = dimensions.find((item) => item.name === name)
    this._router.navigate([`dimension/${dimension.__id__}`], { relativeTo: this._route })
  }

  newQuery(statement?: string) {
    const key = uid10()
    this.updater((state) => {
      state.queries.push({
        key,
        name: 'Untitled_1',
        modelId: state.id,
        options: {
          entities: [],
          statement
        }
      })
    })()

    return key
  }

  readonly updateQueries = this.updater((state, queries: ModelQueryState[]) => {
    // state.queries = queries
  })

  /**
   * 打开实体编辑页面
   *
   * @param entity
   */
  activeEntity(entity: Partial<SemanticModelEntity>) {
    if (entity.type === SemanticModelEntityType.CUBE) {
      this.router.navigate([`entity/${entity.id}`], { relativeTo: this.route })
    } else {
      this.router.navigate([`dimension/${entity.id}`], { relativeTo: this.route })
    }
  }

  moveItemInDimensions = this.updater((state, event: { previousIndex: number; currentIndex: number }) => {
    // moveItemInArray(state.dimensions, event.previousIndex, event.currentIndex)
  })

  moveItemInCubes = this.updater((state, event: { previousIndex: number; currentIndex: number }) => {
    // moveItemInArray(state.cubes, event.previousIndex, event.currentIndex)
  })

  moveItemInVirtualCubes = this.updater((state, event: { previousIndex: number; currentIndex: number }) => {
    const virtualCubes = state.schema.virtualCubes
    moveItemInArray(virtualCubes, event.previousIndex, event.currentIndex)
  })

  updateDirty(id: string, dirty: boolean) {
    this.dirty.update((state) => ({
      ...state,
      [id]: dirty
    }))
  }
}

function upsertItem<T extends {__id__?: string}>(items: Array<T>, item: T) {
  const index = items.findIndex((i) => i.__id__ === item.__id__)
  if (index > -1) {
    items.splice(index, 1, {
      ...items[index],
      ...item
    })
  } else {
    items.push(item)
  }

  return items
}