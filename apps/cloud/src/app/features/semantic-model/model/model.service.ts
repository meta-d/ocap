import { CdkDropList, DropListRef, moveItemInArray } from '@angular/cdk/drag-drop'
import { DestroyRef, Injectable, inject } from '@angular/core'
import { nonNullable } from '@metad/core'
import { getSemanticModelKey } from '@metad/story/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import {
  AgentType,
  Cube,
  DataSource,
  DBTable,
  Dimension,
  EntityType,
  isEntitySet,
  isEntityType,
  omit,
  PropertyDimension,
  Schema,
  TableEntity,
  wrapHierarchyValue
} from '@metad/ocap-core'
import { ComponentStore, DirtyCheckQuery } from '@metad/store'
import { convertNewSemanticModelResult, ModelsService, NgmSemanticModel } from '@metad/cloud/state'
import { cloneDeep, sortBy } from 'lodash-es'
import { BehaviorSubject, combineLatest, from, Observable, Subject } from 'rxjs'
import {
  combineLatestWith,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators'
import { getSQLSourceName, ISemanticModel, MDX, registerModel, ToastrService, uid10, uuid } from '../../../@core'
import {
  initDimensionSubState,
  initEntitySubState,
  ModelCubeState,
  ModelDimensionState,
  MODEL_TYPE,
  PACModelState,
  SemanticModelEntity,
  SemanticModelEntityType,
  ModelQueryState
} from './types'
import { NGXLogger } from 'ngx-logger'


@Injectable()
export class SemanticModelService extends ComponentStore<PACModelState> {

  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly destroyRef = inject(DestroyRef)
  private readonly logger = inject(NGXLogger)
  readonly #toastr = inject(ToastrService)

  get model() {
    return this.get((state) => state.model)
  }
  public readonly model$ = this.select((state) => state.model)
  public readonly modelId$ = this.select((state) => state.model?.id)
  public readonly dialect$ = this.select((state) => state.model?.dataSource?.type?.type)
  public readonly isLocalAgent$ = this.select((state) => state.model?.dataSource?.type?.type === 'agent')

  public get tables() {
    return this.get((state) => state.model.tables)
  }

  public readonly tables$ = this.model$.pipe(map((model) => model?.tables))
  public readonly cubeStates$ = this.select((state) => state.cubes)
  public readonly dimensionStates$ = this.select((state) => state.dimensions)
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

  public readonly modelType$ = this.select(this.model$.pipe(filter((model) => !!model)), (model) => {
    if (model.type === 'XMLA') {
      if (model.dataSource.type.protocol?.toUpperCase() !== 'XMLA') {
        return MODEL_TYPE.OLAP
      } else {
        return MODEL_TYPE.XMLA
      }
    }
    // todo 其他情况
    return MODEL_TYPE.SQL
  })

  public readonly isWasm$ = this.model$.pipe(map((model) => model?.agentType === AgentType.Wasm))
  public readonly isXmla$ = this.model$.pipe(map((model) => model?.type === 'XMLA'))
  public readonly isOlap$ = this.modelType$.pipe(map((modelType) => modelType === MODEL_TYPE.OLAP))
  public readonly isSQLSource$ = this.model$.pipe(map((model) => model.dataSource?.type?.protocol?.toUpperCase() === 'SQL' || model?.agentType === AgentType.Wasm))
  public readonly wordWrap$ = this.select((state) => state.viewEditor?.wordWrap)

  public readonly currentCube$ = combineLatest([
    this.select((state) => state.currentEntity),
    this.cubeStates$
  ]).pipe(
    map(([current, cubeStates]) => cubeStates?.find((item) => item.id === current)?.cube),
    takeUntilDestroyed(),
    shareReplay(1)
  )
  public readonly currentDimension$ = combineLatest([
    this.select((state) => state.currentEntity),
    this.dimensionStates$
  ]).pipe(
    map(([current, dimensionStates]) => dimensionStates?.find((item) => item.id === current)?.dimension),
    takeUntilDestroyed(),
    shareReplay(1)
  )

  public readonly currentEntityType$ = combineLatest([
    this.select((state) => state.currentEntity),
    this.entities$
  ]).pipe(
    map(([currentEntity, entities]) => entities?.find((item) => item.id === currentEntity)?.type),
    takeUntilDestroyed(),
    shareReplay(1)
  )

  // Model Roles
  public readonly stories$ = this.select((state) => state.stories)
  public readonly cubes$ = this.select((state) => state.model.schema?.cubes)
  public readonly virtualCubes$ = this.select((state) => (state.model.schema as any)?.virtualCubes).pipe(
      combineLatestWith(this.isOlap$.pipe(filter((isOlap) => isOlap))
    ),
    map(([virtualCubes]) => virtualCubes?.map((item) => ({...item, type: SemanticModelEntityType.VirtualCube})))
  )
  public readonly dimensions$ = this.select((state) => state.model?.schema?.dimensions).pipe(
    combineLatestWith(this.isOlap$.pipe(filter((isOlap) => isOlap))),
    map(([dimensions]) => dimensions)
  )
  public readonly roles$ = this.model$.pipe(combineLatestWith(this.isOlap$.pipe(filter((isOlap) => isOlap))), map(([model, isOlap]) => model?.roles))
  public readonly indicators$ = this.model$.pipe(map((model) => model.indicators))

  readonly dataSource$ = new BehaviorSubject<DataSource>(null)
  get dataSource() {
    return this.dataSource$.value
  }

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
  
  public readonly selectDBTables$: Observable<DBTable[]> = this.originalDataSource$.pipe(
    filter(nonNullable),
    switchMap((dataSource) => dataSource.discoverDBTables()),
  )

  private dirtyCheckQuery: DirtyCheckQuery = new DirtyCheckQuery(this, {
    watchProperty: ['model', 'ids'],
    clean: (head, current) => {
      return this._saveModel()
    }
  })

  public dirty$ = combineLatest([
    this.dirtyCheckQuery.isDirty$.pipe(startWith(false)),
    this.entities$.pipe(map((entities) => entities.some((entity) => entity.dirty)))
  ]).pipe(
    map(([isDirty, entities]) => isDirty || entities),
    takeUntilDestroyed(),
    shareReplay(1)
  )

  private _saved$ = new Subject<void>()
  public readonly saved$ = this._saved$.asObservable()
  public readonly dragReleased$ = new Subject<DropListRef<CdkDropList<any>>>()

  /**
  |--------------------------------------------------------------------------
  | Signals
  |--------------------------------------------------------------------------
  */
  readonly modelType = toSignal(this.modelType$)

  constructor(
    private modelsService: ModelsService,
    private dsCoreService: NgmDSCoreService,
    private wasmAgent: WasmAgentService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {
    super({} as PACModelState)

    // TODO 一个状态改变产生另一个状态, 这种需求应该怎么处理??
    this.entities$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((entities) => {
      this.patchState({ ids: entities?.map((state) => state.id) })
    })

    this.model$
      .pipe(
        filter(nonNullable),
        map(getSemanticModelKey),
        distinctUntilChanged(),
        filter(nonNullable),
        switchMap((key) => this.dsCoreService.getDataSource(key)),
        // 先清 DataSource 缓存再进行后续
        switchMap((dataSource) => from(dataSource?.clearCache() ?? [true]).pipe(map(() => dataSource))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(this.dataSource$)

    this.model$
      .pipe(
        filter(nonNullable),
        distinctUntilChanged((a, b) => a.key === b.key),
        switchMap((model) => {
          if (model.type === 'XMLA' && model.dataSource?.type?.protocol?.toUpperCase() === 'SQL') {
            return this.dsCoreService.getDataSource(getSQLSourceName(getSemanticModelKey(model)))
          }
          return this.dsCoreService.getDataSource(getSemanticModelKey(model))
        }),
        // 先清 DataSource 缓存再进行后续
        switchMap((dataSource) => from(dataSource?.clearCache() ?? [true]).pipe(map(() => dataSource))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(this.originalDataSource$)

    // @todo 存在不必要的注册动作，需要重构
    this.model$
      .pipe(
        filter(nonNullable),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((model) => {
        this.logger.debug(`Model changed => call registerModel`)
        // Not contain indicators when building model
        registerModel(omit(model, 'indicators'), this.dsCoreService, this.wasmAgent)
      })

    this.dataSource$.pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef)).subscribe((dataSource) => {
      dataSource?.clearCache()
    })
  }

  initModel(model: ISemanticModel) {
    this.patchState({ stories: model.stories })
    this._setModel(convertNewSemanticModelResult(model))
    this.dirtyCheckQuery.setHead()
  }

  saveModel() {
    this.dirtyCheckQuery.reset()
  }

  /**
   * 语义模型保存
   *
   */
  _saveModel() {
    this.rollupEntities()
    const model = cloneDeep(this.get((state) => state.model))
    model.roles = model.roles.map((role, index) => ({...role, index}))

    return this.#toastr.update({code: 'PAC.MODEL.MODEL.TITLE', params: {Default: 'Semantic Model'}}, () => {
        return this.modelsService.update(model.id, model, {relations: ['roles', 'roles.users']})
      })
      .pipe(
        tap(async (model) => {
          this.updateModel({roles: sortBy(model.roles, 'index')})
          this._saved$.next()
          this._resetDirty()
          this.dataSource?.clearCache()
        })
      )
  }

  /**
   * 收集子状态中需要保存的数据
   */
  readonly rollupEntities = this.updater((state) => {
    state.model.schema = (state.model.schema || { name: state.model.name }) as Schema
    state.model.schema.dimensions = state.dimensions
      .map((dimensionState) => dimensionState.dimension)
      .filter((cube) => !!cube)
    state.model.schema.cubes = state.cubes.map((entityState) => entityState.cube).filter((cube) => !!cube)
  })

  /**
   * 初始化 Semantic Model UI State 和子状态
   */
  private readonly _setModel = this.updater((state, model: NgmSemanticModel) => {
    state.activedEntities = []
    state.model = model
    state.model.roles = sortBy(state.model.roles, 'index')
    state.cubes = initEntitySubState(model)
    state.dimensions = initDimensionSubState(model)
    if (state.currentEntity) {
      const entity = [...state.cubes, ...state.dimensions].find((entity) => entity.id === state.currentEntity)
      if (entity) {
        state.activedEntities.push(entity)
      }
    }
  })

  private readonly _resetDirty = this.updater((state) => {
    state.dimensions.forEach((dimension) => (dimension.dirty = false))
    state.cubes.forEach((cube) => (cube.dirty = false))
  })

  /**
   * 激活(打开) Entity
   */
  readonly setCrrentEntity = this.updater((state, id: string) => {
    let entity = state.activedEntities?.find((entity) => entity.id === id)
    if (!entity) {
      entity = state.cubes?.find((entity) => entity.id === id)
      if (!entity) {
        entity = state.dimensions?.find((entity) => entity.id === id)
      }
      if (entity) {
        state.activedEntities.push(entity)
      }
    }

    state.currentEntity = id
  })

  readonly updateModel = this.updater((state, model: Partial<NgmSemanticModel>) => {
    state.model = {
      ...state.model,
      ...model
    }
  })

  readonly addTable = this.updater((state, table: TableEntity) => {
    state.model.tables = state.model.tables ?? []
    const index = state.model.tables?.findIndex((item) => item.name === table.name)
    if (index > -1) {
      throw new Error(`Table name '${table.name}' exists!`)
    }
    state.model.tables.push(table)
  })
  readonly editTable = this.updater((state, table: TableEntity) => {
    state.model.tables = state.model.tables ?? []
    const index = state.model.tables?.findIndex((item) => item.name === table.name)
    if (index > -1) {
      state.model.tables.splice(index, 1, table)
    } else {
      state.model.tables.push(table)
    }
  })
  readonly deleteTable = this.updater((state, name: string) => {
    const index = state.model.tables?.findIndex((item) => item.name === name)
    if (index > -1) {
      state.model.tables.splice(index, 1)
    }
  })

  /**
   * Create cube : Cube
   */
  createCube({ name, caption, table, expression, columns }) {
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
      if (column.measure) {
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
    this.newEntity(state)
    return state
  }

  readonly createVirtualCube = this.updater((state, {id, name, caption, cubes}: any) => {
    const schema = state.model.schema as Schema
    schema.virtualCubes = schema.virtualCubes ?? []
    schema.virtualCubes.push({
      __id__: id,
      name,
      caption,
      cubeUsages: cubes?.map((cube: Cube) => ({
        cubeName: cube.name
      })) ?? []
    } as Partial<MDX.VirtualCube>)
  })

  createDimension({ name, caption, table, expression, primaryKey, columns }) {
    const id = uuid()
    const state = {
      type: SemanticModelEntityType.DIMENSION,
      id,
      name: name,
      dimension: {
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
            levels: columns?.map((column) => ({
              __id__: uuid(),
              name: column.name,
              caption: column.caption,
              column: column.name,
            })) ?? []
          }
        ]
      },
      dirty: true
    } as ModelDimensionState
    this.newDimension(state)
    return state
  }

  // Actions for entity
  readonly newEntity = this.updater((state, cube: ModelCubeState) => {
    state.cubes.push(cube)
  })

  /**
   * 删除实体数据: Cube, Dimension, VirtualCube
   */
  readonly deleteEntity = this.updater((state, id: string) => {
    state.cubes = state.cubes.filter((item) => item.id !== id)
    state.dimensions = state.dimensions.filter((item) => item.id !== id)
    state.activedEntities = state.activedEntities.filter((item) => item.id !== id);
    (state.model.schema as any).virtualCubes = (state.model.schema as any).virtualCubes?.filter((item) => item.__id__ !== id)
  })

  readonly newDimension = this.updater((state, dimension: ModelDimensionState) => {
    state.dimensions.push(dimension)
  })

  readonly updateDimension = this.updater((state, dimension: PropertyDimension) => {
    const dimensionState = state.dimensions.find((item) => item.id === dimension.__id__)
    if (dimensionState) {
      dimensionState.dimension = dimension
    }
  })

  /**
   * Update cube of schema in {@link DataSource}
   * 
   * @param cube 
   */
  updateDataSourceSchemaCube(cube: Cube) {
    this.dataSource?.updateCube(cube)
    this.originalDataSource?.updateCube(cube)
  }

  /**
   * Update entityType of schema in {@link DataSource}
   * 
   * @param entityType 
   */
  updateDataSourceSchemaEntityType(entityType: EntityType) {
    this.dataSource?.setEntityType(entityType)
  }

  /** ========================== Select Queries ========================== */
  selectEntitySet(cubeName: string) {
    return this.dataSource$.pipe(
      filter(nonNullable),
      switchMap((dataSource) => dataSource.selectEntitySet(cubeName)),
    )
  }

  selectEntityType(cubeName: string): Observable<EntityType> {
    return this.selectEntitySet(cubeName).pipe(
      filter(isEntitySet),
      map(({entityType}) => entityType)
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
    return this.dataSource$.pipe(filter(Boolean),
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
      switchMap((dataSource) => dataSource.selectEntitySet(entity)),
      map((error) => isEntitySet(error) ? null : error)
    )
  }

  selectOriginalEntityService(entityName: string) {
    return this.originalDataSource$.pipe(
      filter((dataSource) => !!dataSource),
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
      switchMap((dataSource) => dataSource.selectMembers(entity, dimension)),
      map((members) => members.map((member) => ({
        ...member,
        memberKey: wrapHierarchyValue(dimension.hierarchy, member.memberKey)
      }))),
      takeUntilDestroyed(this.destroyRef),
    )
  }

  navigateDimension(name: string) {
    const dimensions = this.get((state) => state.dimensions)
    const dimension = dimensions.find((item) => item.dimension.name === name)
    this._router.navigate([`dimension/${dimension.dimension.__id__}`], { relativeTo: this._route })
  }

  newQuery(statement?: string) {
    const key = uid10()
    this.updater((state) => {
      state.model.queries.push(
        {
          key,
          name: 'Untitled_1',
          modelId: state.model.id,
          options: {
            entities: [],
            statement
          }
        }
      )
    })()

    return key
  }

  readonly updateQueries = this.updater((state, queries: ModelQueryState[]) => {
    state.queries = queries
  })

  /**
   * 打开实体编辑页面
   *
   * @param entity
   */
  activeEntity(entity: SemanticModelEntity) {
    if (entity.type === SemanticModelEntityType.CUBE) {
      this.router.navigate([`entity/${entity.id}`], { relativeTo: this.route })
    } else {
      this.router.navigate([`dimension/${entity.id}`], { relativeTo: this.route })
    }
  }
  
  moveItemInDimensions = this.updater((state, event: {previousIndex: number; currentIndex: number;}) => {
    moveItemInArray(state.dimensions, event.previousIndex, event.currentIndex)
  })

  moveItemInCubes = this.updater((state, event: {previousIndex: number; currentIndex: number;}) => {
    moveItemInArray(state.cubes, event.previousIndex, event.currentIndex)
  })

  moveItemInVirtualCubes = this.updater((state, event: {previousIndex: number; currentIndex: number;}) => {
    const virtualCubes = state.model.schema.virtualCubes
    moveItemInArray(virtualCubes, event.previousIndex, event.currentIndex)
  })
}
