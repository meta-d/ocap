import { CdkDrag, CdkDragDrop, CdkDragRelease, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnInit } from '@angular/core'
import { SplitterType } from '@metad/ocap-angular/common'
import {
  AggregationRole,
  getEntityDimensions,
  getEntityMeasures,
  Join,
  pick,
  Property,
  PropertyDimension,
  PropertyHierarchy,
  PropertyLevel,
  PropertyMeasure,
  Table
} from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { NxCoreService, nonBlank } from '@metad/core'
import { ToastrService, uuid } from 'apps/cloud/src/app/@core'
import { isEmpty, values } from 'lodash-es'
import { combineLatest, firstValueFrom, Observable } from 'rxjs'
import { combineLatestWith, filter, map, shareReplay, switchMap, tap, withLatestFrom } from 'rxjs/operators'
import { TranslationBaseComponent } from '../../../../../@shared'
import { SemanticModelService } from '../../model.service'
import { MODEL_TYPE } from '../../types'
import { ModelEntityService } from '../entity.service'
import { newDimensionFromColumn } from '../types'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { effectAction } from '@metad/ocap-angular/core'

@UntilDestroy({ checkProperties: true })
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-model-structure',
  templateUrl: './structure.component.html',
  styleUrls: ['./structure.component.scss']
})
export class ModelEntityStructureComponent extends TranslationBaseComponent implements OnInit {
  @HostBinding('class.pac-model-cube-structure') _isModelCubeStructure = true
  SplitterType = SplitterType

  dimensions: Property[] = []
  measures: Property[] = []
  allVisible = false
  get visibleIndeterminate() {
    return !!(this.dimensions.find((item) => item.visible) || this.measures.find((item) => item.visible)) && this.allVisible
  }
  get visibleEmpty() {
    return !(this.dimensions.find((item) => item.visible) || this.measures.find((item) => item.visible))
  }

  public readonly isXmla$ = this.modelService.modelType$.pipe(filter((modelType) => modelType === MODEL_TYPE.XMLA))
  public readonly isSQLSource$ = this.modelService.isSQLSource$

  public readonly tables$ = this.entityService.tables$
  public readonly factTable$ = this.tables$.pipe(map((tables) => tables?.[0]))
  readonly fectTableFields$ = this.factTable$.pipe(
    map((table) => table?.name),
    filter(nonBlank),
    switchMap((tableName) => this.modelService.selectOriginalEntityProperties(tableName)),
    takeUntilDestroyed(),
    shareReplay(1)
  )
  public readonly fectTableFieldOptions$ = this.fectTableFields$.pipe(
    map((properties) => properties.map((property) => ({
      key: property.name,
      value: property,
      caption: property.caption,

    })))
  )

  options$ = combineLatest([this.modelService.wordWrap$, this.coreService.onThemeChange()]).pipe(
    map(([wordWrap, { name }]) => ({
      wordWrap,
      theme: name === 'default' ? 'vs' : `vs-${name}`
    })),
    tap((options) => console.debug(`[pac-model-structure] editor options`, options))
  )

  public readonly expression$ = this.entityService.cube$.pipe(map((cube) => cube?.expression))

  private _tableJoins = {}
  private _tableTypes = {}

  // Subscribers
  private _originEntityTypeSub$ = this.entityService.originalEntityType$
    .pipe(
      combineLatestWith(
        this.isXmla$,
        this.entityService.select((state) => state.dimensions),
        this.entityService.select((state) => state.measures)
      ),
      filter(
        ([properties, isXmla, dimensions, measures]) => isXmla && isEmpty(this.dimensions) && isEmpty(this.measures)
      )
    )
    .subscribe(([entityType, isXmla, dimensions, measures]) => {
      this.dimensions = structuredClone(
        dimensions ?? getEntityDimensions(entityType).map((item) => ({ ...item, dataType: 'string' }))
      )
      this.measures = structuredClone(
        measures ?? getEntityMeasures(entityType).map((item) => ({ ...item, dataType: 'number' }))
      )
      this._cdr.detectChanges()
    })
  constructor(
    public coreService: NxCoreService,
    public modelService: SemanticModelService,
    public entityService: ModelEntityService,
    private _toastrService: ToastrService,
    private _cdr: ChangeDetectorRef
  ) {
    super()
  }

  ngOnInit(): void {
    this.fectTableFields$
      .pipe(
        combineLatestWith(
          this.entityService.select((state) => state.dimensions),
          this.entityService.select((state) => state.measures)
        ),
        filter(([properties, dimensions, measures]) => isEmpty(this.dimensions) && isEmpty(this.measures)),
        untilDestroyed(this)
      )
      .subscribe(([properties, dimensions, measures]) => {
        this.dimensions =
          dimensions ??
          properties.filter(
            (item) => item.role === AggregationRole.dimension && item.dataType?.toLowerCase() !== 'numeric'
          )
        this.measures =
          measures ??
          properties.filter((item) => item.role === AggregationRole.measure || item.dataType?.toLowerCase() === 'numeric')
        this._cdr.detectChanges()
      })
  }

  trackById(index, item) {
    return item.__id__
  }

  dropEnterPredicate(item: CdkDrag<any>) {
    return item.dropContainer.id === 'list-table-measures' || item.dropContainer.id === 'list-table-dimensions'
  }

  async dropProperty(event: CdkDragDrop<Property[]>) {
    if (
      (event.previousContainer.id === 'list-table-dimensions' && event.container.id === 'list-table-measures') ||
      (event.previousContainer.id === 'list-table-measures' && event.container.id === 'list-table-dimensions')
    ) {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex)
    } else if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)
    }
  }

  onDragReleased(event: CdkDragRelease) {
    this.modelService.dragReleased$.next(event.source.dropContainer._dropListRef)
  }

  async confirmOverwriteCube() {
    if (!this.dimensions.filter((item) => item.visible).length && !this.measures.filter((item) => item.visible).length) {
      this._toastrService.warning('PAC.MODEL.ENTITY.PleaseSelectFields', {Default: 'Please select fields!'})
      return false
    }

    const cube = await firstValueFrom(this.entityService.cube$)
    if (cube.dimensions?.length || cube.measures?.length) {
      return await firstValueFrom(this._toastrService.confirm({
        code: 'PAC.MODEL.ENTITY.ConfirmOverwriteCube',
        params: {
          Default: 'The cube configured. Confirm overwrite?'
        }
      }))
    }

    return true
  }

  /**
   * 由数据库表字段生成 Schema cube 定义
   */
  async generate() {
    if (!(await this.confirmOverwriteCube())) {
      return
    }

    const modelType = await firstValueFrom(this.modelService.modelType$)

    const dimensions = this.dimensions
      .filter((item) => item.visible)
      // Xmla 数据源的直接同步，sql 数据源的 1 生成 olap 维度 2 生成 sql 维度
      .map((item) => modelType === MODEL_TYPE.XMLA ? {...item, __id__: uuid(),} : newDimensionFromColumn(item, modelType === MODEL_TYPE.OLAP))

    const measures = this.measures
      .filter((item) => item.visible)
      .map((measure) => {
        return {
          __id__: uuid(),
          name: measure.name,
          caption: measure.caption,
          column: measure.name,
          aggregator: 'sum',
          visible: true
        } as PropertyMeasure
      })

    // Set cube defination
    this.entityService.updateCube({
      dimensions,
      measures
    })
    // Save current meta from data source
    this.entityService.patchState(
      structuredClone({
        dimensions: this.dimensions,
        measures: this.measures
      })
    )
  }

  /**
   * 从 XMLA 数据源同步 Cube 定义到本地 Schema 以便进行增强
   */
  async sync() {
    if (!(await this.confirmOverwriteCube())) {
      return
    }

    const dimensions = this.dimensions
      .filter((item) => item.visible)
      .map((dim) => {
        const dimension = pick(dim, '__id__', 'name', 'caption') as PropertyDimension
        if (dim.hierarchies) {
          dimension.hierarchies = dim.hierarchies.map((hier) => {
            const hierarchy = pick(hier, '__id__', 'name', 'caption') as PropertyHierarchy
            if (hier.levels) {
              hierarchy.levels = hier.levels.map((l) => {
                const level = pick(l, '__id__', 'name', 'caption') as PropertyLevel
                return level
              })
            }
            return hierarchy
          })
        }
        return dimension
      })

    const measures = this.measures
      .filter((item) => item.visible)
      .map(
        (measure) =>
          ({
            ...pick(measure, 'name', 'caption'),
            __id__: uuid()
          } as PropertyMeasure)
      )

    // Set cube defination
    this.entityService.updateCube({
      dimensions,
      measures
    })
    // Save current meta from data source
    this.entityService.patchState(
      structuredClone({
        dimensions: this.dimensions,
        measures: this.measures
      })
    )
  }

  toggleVisibleAll(visible: boolean) {
    this.dimensions.forEach((item) => (item.visible = visible))
    this.measures.forEach((item) => (item.visible = visible))
  }

  selectTableJoin(table: Table) {
    if (!this._tableJoins[table.__id__]) {
      this._tableJoins[table.__id__] = this.tables$.pipe(
        map((tables) => tables.find(({ __id__ }) => __id__ === table.__id__)?.join),
        untilDestroyed(this),
        shareReplay(1)
      )
    }
    return this._tableJoins[table.__id__] as Observable<Join>
  }

  selectTableType(table: Table) {
    if (!this._tableTypes[table?.name]) {
      this._tableTypes[table?.name] = this.modelService.selectOriginalEntityType(table?.name).pipe(
        map((entityType) => values(entityType?.properties).map((property) => ({
          value: property,
          key: property.name,
          caption: property.caption
        }))),
        untilDestroyed(this),
        shareReplay(1)
      )
    }
    return this._tableTypes[table?.name]
  }

  setModel(event) {
    // 不再从编辑器修改模型
    // this.entityService.setCube(event.cube)
    // this.entityService.setEntityType(event.entityType)
  }

  changeExpression(value) {
    this.entityService.setExpression(value)
  }

  readonly drop = effectAction((event$: Observable<CdkDragDrop<Table[]>>) => {
    return event$.pipe(
      withLatestFrom(this.tables$),
      tap(([event, tables]) => {
        if (event.previousContainer === event.container) {
          moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)
        } else if (event.previousContainer.id === 'pac-model-entitysets') {
          const name = event.item.data.name
          this.entityService.addCubeTable(
            isEmpty(tables)
              ? { name }
              : {
                  name,
                  join: {
                    type: 'Inner',
                    fields: [
                      {
                        leftKey: null,
                        rightKey: null
                      }
                    ]
                  }
                }
          )
        }
      })
    )
  })

  removeTable(table: Table) {
    this.entityService.removeCubeTable(table)
  }

  changeJoinType(table: Table, type) {
    this.entityService.changeTableJoinType({ table, type })
  }

  addJoinField(table: Table) {
    this.entityService.addCubeTableJoin(table)
  }

  removeJoinField(table: Table, index: number) {
    this.entityService.removeJoinField({ table, index })
  }

  changeLeftKey(table: Table, index: number, key: string) {
    this.entityService.changeJoinLeftKey({ table, index, key: key as string })
  }

  changeRightKey(table: Table, index: number, key: string) {
    this.entityService.changeJoinRightKey({ table, index, key: key as string })
  }
}
