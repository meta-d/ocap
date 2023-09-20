import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { Injectable, Optional, inject } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { EntityService, PropertyHierarchy, PropertyLevel, Table } from '@metad/ocap-core'
import { ComponentSubStore, DirtyCheckQuery } from '@metad/store'
import { NxSettingsPanelService } from '@metad/story/designer'
import { NgmError, ToastrService, uuid } from 'apps/cloud/src/app/@core'
import { assign, cloneDeep, isEqual, isNil } from 'lodash-es'
import { NGXLogger } from 'ngx-logger'
import {
  combineLatestWith,
  filter,
  map,
  Observable,
  shareReplay,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs'
import { SemanticModelService } from '../../model.service'
import { ModelDesignerType, ModelDimensionState } from '../../types'
import { ModelDimensionService } from '../dimension.service'


@Injectable()
export class ModelHierarchyService extends ComponentSubStore<PropertyHierarchy, ModelDimensionState> {
  private readonly toastrService = inject(ToastrService)
  private readonly modelService = inject(SemanticModelService)
  private readonly settingsService = inject(NxSettingsPanelService)
  private readonly logger? = inject(NGXLogger, {optional: true})

  // Signals
  private readonly sharedDimensions = toSignal(this.modelService.dimensions$)

  // Query
  public readonly name$ = this.select((state) => state.name)
  public readonly caption$ = this.select((state) => state.caption)
  public readonly tables$ = this.select((state) => state.tables)
  public tableName$ = this.select((state) => {
    return state.primaryKeyTable ?? state.tables?.[0]?.name
  })

  public readonly hierarchy$ = this.select((state) => state)
  public readonly levels$ = this.select((state) => state.levels)
  public readonly modeling$ = this.hierarchy$.pipe(
    combineLatestWith(this.parentService.dimension$),
    map(([hierarchy, dimension]) => ({
      modeling: hierarchy,
      dimension,
      hierarchies: dimension?.hierarchies,
      dimensions: this.sharedDimensions().filter((item) => item.__id__ !== dimension.__id__)
    }))
  )

  public entityService$: Observable<EntityService<unknown>> = this.tableName$.pipe(
    filter((value) => !!value),
    switchMap((table) => this.modelService.selectOriginalEntityService(table)),
    shareReplay(1)
  )

  public entityType$ = this.tableName$.pipe(
    switchMap((tableName) => this.modelService.selectOriginalEntityType(tableName)),
    shareReplay(1)
  )

  /**
   * 当前选中列
   */
  column: string

  constructor(
    private parentService: ModelDimensionService,
  ) {
    super({} as PropertyHierarchy)
  }

  public init(id: string) {
    this.connect(this.parentService, {
      parent: ['dimension', 'hierarchies', id],
      arrayKey: '__id__'
    })
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.parentService.setCurrentHierarchy(id)
      })
  }

  /**
   * 更新 Hierarchy state
   *
   * 对于空值覆盖问题应该有更好的办法
   */
  readonly updateHierarchy = this.updater((state, hierarchy: Partial<PropertyHierarchy>) => {
    Object.keys(state).forEach((key) => {
      if (key !== 'levels') {
        state[key] = hierarchy[key] ?? state[key]
      }
    })
    assign(state, hierarchy)
  })

  readonly setupDesigner = this.effect((origin$: Observable<void>) => {
    return origin$.pipe(
      withLatestFrom(this.hierarchy$),
      switchMap(([, hierarchy]) => {
        return this.settingsService.openDesigner(ModelDesignerType.hierarchy, this.modeling$, hierarchy.__id__)
      }),
      tap((model: any) => {
        this.updateHierarchy(model.modeling)
        this.parentService.update(model.dimension)
      })
    )
  })

  readonly setupLevelDesigner = this.effect((origin$: Observable<string>) => {
    return origin$.pipe(
      withLatestFrom(this.state$),
      switchMap(([id, state]) => {
        // this.column = column
        const level = state.levels.find((level) => level.__id__ === id)
        const model = {
          hierarchy: state,
          modeling: cloneDeep(level)
        }
        // const id = model.modeling.__id__
        return this.settingsService.openDesigner(ModelDesignerType.level, model, id).pipe(
          tap(({ modeling }: any) => {
            if (modeling.name) {
              this.updateLevel(
                {
                  ...modeling,
                  __id__: id
                }
              )
            }
          })
        )
      })
    )
  })

  readonly setTables = this.updater((state, tables: Table[]) => {
    if (!isEqual(state?.tables, tables)) {
      state.tables = tables
    }
  })

  readonly appendTable = this.updater((state, name: string) => {
    state.tables = state.tables ?? []
    const _index = state.tables.findIndex((item) => item.name === name)
    if (_index < 0) {
      const table: Table = {name}
      if (state.tables.length > 0) {
        table.join = {
          type: 'Inner', fields: []
        }
      }
      state.tables.push(table)
    }
  })

  readonly removeTable = this.updater((state, name: string) => {
    const index = state.tables.findIndex((item) => item.name === name)
    if (index > -1) {
      state.tables.splice(index, 1)
    }
  })

  readonly moveItemInTables = this.updater((state, {previousIndex, currentIndex}: CdkDragDrop<Table[]>) => {
    moveItemInArray(state.tables, previousIndex, currentIndex)
  })

  readonly appendLevel = this.updater((state, {name, table}: PropertyLevel) => {
    state.levels = state.levels ?? []
    const index = state.levels.findIndex((level) => level.column === name)
    if (index < 0) {
      state.levels.push({
        __id__: uuid(),
        name,
        column: name,
        table
      })
    } else {
      const primaryTable = state.primaryKeyTable || state.tables[0]?.name
      // 字段相同并且表相同
      const index = state.levels.findIndex((level) => level.column === name && 
        (!level.table ? primaryTable === table : level.table === table))
      
      if (index < 0) {
        state.levels.push({
          __id__: uuid(),
          name: `${name} (${table})`,
          column: name,
          table
        })
      } else {
        this.toastrService.error('PAC.MODEL.DIMENSION.SameLevelAlreadyExists', '', {Default: 'The same level already exists'})
      }
    }
  })

  readonly moveLevelInArray = this.updater((state, {previousIndex, currentIndex}: CdkDragDrop<PropertyLevel[]>) => {
    moveItemInArray(state.levels, previousIndex, currentIndex)
  })

  readonly removeLevel = this.updater((state, id: string) => {
    const index = state.levels.findIndex((item) => item.__id__ === id)
    if (index > -1) {
      state.levels.splice(index, 1)
    }
  })

  readonly updateLevel = this.updater((state, model: PropertyLevel) => {
    const index = state.levels?.findIndex((level) => level.__id__ === model.__id__)
    if (index >= 0) {
      // state.levels[level] = assign(state.levels[level], model)
      state.levels[index] = model
    } else {
      state.levels = state.levels ?? []
      state.levels.push(model)
    }
  })

  readonly removeCurrentLevel = this.updater((state) => {
    const index = state.levels?.findIndex((level) => level.column === this.column)
    if (index >= 0) {
      state.levels.splice(index, 1)
    }
  })
}
