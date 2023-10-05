import { CdkDrag, CdkDragDrop, CdkDragRelease } from '@angular/cdk/drag-drop'
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  HostListener,
  Inject,
  ViewChild,
  ViewContainerRef,
  inject
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FormControl } from '@angular/forms'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog'
import { ActivatedRoute, Router } from '@angular/router'
import { CopilotChatMessageRoleEnum } from '@metad/copilot'
import { DBTable, PropertyAttributes, TableEntity, pick } from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { ModelsService, NgmSemanticModel } from '@metad/cloud/state'
import { ConfirmDeleteComponent, ConfirmUniqueComponent } from '@metad/components/confirm'
import { NX_STORY_STORE, NxStoryStore, StoryModel } from '@metad/story/core'
import { NxSettingsPanelService } from '@metad/story/designer'
import { sortBy, uniqBy } from 'lodash-es'
import {
  BehaviorSubject,
  Subject,
  catchError,
  combineLatest,
  combineLatestWith,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap
} from 'rxjs'
import { ISemanticModel, MenuCatalog, ToastrService, getErrorMessage, routeAnimations, uuid } from '../../../@core'
import { CopilotChatComponent } from '../../../@shared'
import { TranslationBaseComponent } from '../../../@shared/language/translation-base.component'
import { AppService } from '../../../app.service'
import { exportSemanticModel } from '../types'
import { ModelUploadComponent } from '../upload/upload.component'
import { ModelCreateEntityComponent } from './create-entity/create-entity.component'
import { ModelCreateTableComponent } from './create-table/create-table.component'
import { ModelCopilotEngineService } from './model-copilot.service'
import { SemanticModelService } from './model.service'
import { ModelPreferencesComponent } from './preferences/preferences.component'
import { MODEL_TYPE, SemanticModelEntity, SemanticModelEntityType, TOOLBAR_ACTION_CATEGORY } from './types'
import { stringifyTableType } from './utils'


@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'ngm-semanctic-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
  providers: [NxSettingsPanelService, SemanticModelService, ModelCopilotEngineService],
  host: {
    class: 'ngm-semanctic-model'
  },
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelComponent extends TranslationBaseComponent {
  SemanticModelEntityType = SemanticModelEntityType
  TOOLBAR_ACTION_CATEGORY = TOOLBAR_ACTION_CATEGORY

  private readonly _modelCopilotEngine = inject(ModelCopilotEngineService)

  get copilotEngine() {
    return this._copilotEngine ?? this._modelCopilotEngine
  }
  set copilotEngine(value) {
    this._copilotEngine = value
  }
  private _copilotEngine = null

  @ViewChild('copilotChat') copilotChat!: CopilotChatComponent

  @HostBinding('class.pac-fullscreen')
  public isFullscreen = false

  // Model
  searchControl = new FormControl()
  // Actions events
  public readonly editorAction$ = new Subject()
  public readonly toolbarAction$ = new Subject<{ category: TOOLBAR_ACTION_CATEGORY; action: string }>()

  get dbInitialization() {
    return this.modelService.model?.dbInitialization
  }

  public id$ = this.route.paramMap.pipe(
    startWith(this.route.snapshot.paramMap),
    map((paramMap) => paramMap.get('id')),
    filter(Boolean),
    map(decodeURIComponent),
    distinctUntilChanged(),
    takeUntilDestroyed(),
    shareReplay(1)
  )

  public readonly isMobile$ = this.appService.isMobile$
  public readonly isNotMobile$ = this.appService.isMobile$.pipe(map((isMobile) => !isMobile))
  public readonly entities$ = this.modelService.entities$

  public dbTablesError = ''
  private refreshDBTables$ = new BehaviorSubject<void>(null)
  public readonly selectDBTables$ = this.refreshDBTables$.pipe(
    // Refresh DB Tables
    // Reset fetch tables error
    tap(() => (this.dbTablesError = null)),
    switchMap(() =>
      this.modelService.selectDBTables$.pipe(
        catchError((err) => {
          // When fetch tables error
          this.dbTablesError = err.message
          return of([])
        })
        // startWith([])
      )
    ),
    map((tables) => sortBy(tables, 'name')),
    untilDestroyed(this),
    shareReplay(1)
  )
  public readonly entitySets$ = combineLatest([
    this.modelService.tables$.pipe(map((tables) => tables ?? [])),
    this.selectDBTables$
  ]).pipe(
    // merge tables config and db tables, and sort by name
    map(([tables, dbTables]) => sortBy(uniqBy([...tables, ...dbTables], 'name'), 'name') as any[]),
    // Search tables
    combineLatestWith(this.searchControl.valueChanges.pipe(startWith(null))),
    map(([entities, text]) => {
      text = text?.toLowerCase()
      if (text) {
        return entities.filter(
          (entity) =>
            entity.caption?.toLowerCase().includes(text) ||
            entity.name.toLowerCase().includes(text) ||
            // Backward compatibility 'label'
            entity.label?.toLowerCase().includes(text)
        )
      }
      return entities
    })
  )

  public readonly isWasm$ = this.modelService.isWasm$
  public readonly isOlap$ = this.modelService.isOlap$
  public readonly writable$ = combineLatest([this.modelService.isWasm$, this.modelService.modelType$]).pipe(
    map(([isWasm, modelType]) => !isWasm && (modelType === MODEL_TYPE.OLAP || modelType === MODEL_TYPE.SQL))
  )
  public readonly isDirty$ = this.modelService.dirty$
  public readonly stories$ = this.modelService.stories$
  public readonly currentEntityType$ = this.modelService.currentEntityType$

  public readonly virtualCubes$ = this.modelService.virtualCubes$

  public readonly copilotEnabled$ = this.appService.copilotEnabled$

  model: ISemanticModel

  // inner states
  clearingServerCache: boolean
  constructor(
    public appService: AppService,
    private modelService: SemanticModelService,
    private modelsService: ModelsService,
    @Inject(NX_STORY_STORE) private storyStore: NxStoryStore,
    private route: ActivatedRoute,
    private router: Router,
    private _dialog: MatDialog,
    private _viewContainerRef: ViewContainerRef,
    private toastrService: ToastrService
  ) {
    super()
  }

  ngOnInit() {
    this.model = this.route.snapshot.data['storyModel']
    this.appService.setNavigation({ catalog: MenuCatalog.Models, id: this.model.id, label: this.model.name })
    this.modelService.initModel(this.model)
  }

  trackById(i: number, item: SemanticModelEntity) {
    return item.id
  }

  entityPredicate(event: CdkDrag<PropertyAttributes>) {
    return event.dropContainer.id === 'pac-model-entitysets'
  }

  drop(event: CdkDragDrop<Array<SemanticModelEntity>>) {
    if (event.previousContainer.id === 'pac-model-entitysets' && event.container.id === 'pac-model-entities') {
      this.createEntity(event.item.data)
    }
  }

  onDragReleased(event: CdkDragRelease) {
    this.modelService.dragReleased$.next(event.source.dropContainer._dropListRef)
  }

  async createEntity(entity?: SemanticModelEntity) {
    const modelType = await firstValueFrom(this.modelService.modelType$)
    const entitySets = await firstValueFrom(this.selectDBTables$)
    if (modelType === MODEL_TYPE.XMLA) {
      const result = await firstValueFrom(
        this._dialog
          .open(ModelCreateEntityComponent, {
            viewContainerRef: this._viewContainerRef,
            data: { model: { name: entity?.name, caption: entity?.caption }, entitySets, modelType }
          })
          .afterClosed()
      )
      if (result) {
        const entity = this.modelService.createCube(result)
        this.activeEntity(entity)
      }
    } else {
      const result = await firstValueFrom(
        this._dialog
          .open(ModelCreateEntityComponent, {
            viewContainerRef: this._viewContainerRef,
            data: { model: { table: entity?.name, caption: entity?.caption }, entitySets, modelType }
          })
          .afterClosed()
      )
      let modelEntity: SemanticModelEntity
      const id = uuid()
      if (result?.type === SemanticModelEntityType.CUBE) {
        modelEntity = this.modelService.createCube(result)
      } else if (result?.type === SemanticModelEntityType.DIMENSION) {
        modelEntity = this.modelService.createDimension(result)
      } else if (result.type === SemanticModelEntityType.VirtualCube) {
        this.modelService.createVirtualCube({ id, ...result })
        this.router.navigate([`virtual-cube/${id}`], { relativeTo: this.route })
      }

      if (modelEntity) {
        this.activeEntity(modelEntity)
      }
    }
  }

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

  saveModel() {
    this.modelService.saveModel()
  }

  saveAsDefaultCube(name: string) {
    this.modelService.updateModel({
      cube: name
    })
  }

  async createStory() {
    const name = await firstValueFrom(this._dialog.open(ConfirmUniqueComponent, {}).afterClosed())

    if (name) {
      try {
        const story = await firstValueFrom(
          this.storyStore.createStory({
            name: name,
            model: {
              id: this.model.id
            } as StoryModel,
            businessAreaId: this.model.businessAreaId
          })
        )
        this.openStory(story.id)
      } catch (err) {
        this.toastrService.error(err, 'PAC.MODEL.MODEL.CreateStory')
      }
    }
  }

  async createByExpression(expression: string) {
    const result = await firstValueFrom(
      this._dialog.open(ModelCreateEntityComponent, { data: { model: { expression } } }).afterClosed()
    )
    let entity: SemanticModelEntity
    if (result?.type === SemanticModelEntityType.CUBE) {
      entity = this.modelService.createCube(result)
    } else if (result?.type === SemanticModelEntityType.DIMENSION) {
      entity = this.modelService.createDimension(result)
    }

    if (entity) {
      this.activeEntity(entity)
    }
  }

  openStory(id: string) {
    this.router.navigate([`/story/${id}/edit`])
  }

  open(route, name) {
    this.router.navigate([route], { relativeTo: this.route })
  }

  createIndicator() {
    this.router.navigate(['/project/indicators/new'], {
      queryParams: {
        modelId: this.model.id
      }
    })
  }

  refreshSchema() {
    this.refreshDBTables$.next()
  }

  deleteEntity(id: string) {
    this.modelService.deleteEntity(id)
    this.router.navigate([`.`], { relativeTo: this.route })
  }

  async addTable() {
    const result = await firstValueFrom(
      this._dialog
        .open(ModelCreateTableComponent, {
          viewContainerRef: this._viewContainerRef,
          disableClose: true
        })
        .afterClosed()
    )
    if (result) {
      this.modelService.addTable(result)
    }
  }

  async editTable(entity: TableEntity) {
    const result = await firstValueFrom(
      this._dialog
        .open(ModelCreateTableComponent, {
          viewContainerRef: this._viewContainerRef,
          disableClose: true,
          data: { model: entity }
        })
        .afterClosed()
    )
    if (result) {
      this.modelService.editTable(result)
    }
  }

  deleteTable(entity: TableEntity) {
    this.modelService.deleteTable(entity.name)
  }

  async removeDBInit() {
    this.modelService.updateModel({
      dbInitialization: null
    })
  }

  async openPreferences(event) {
    const model = await firstValueFrom(this.modelService.model$)
    const result: Partial<NgmSemanticModel> = await firstValueFrom(
      this._dialog
        .open(ModelPreferencesComponent, {
          data: pick(model, 'id', 'name', 'description', 'dataSourceId', 'catalog', 'visibility', 'preferences')
        })
        .afterClosed()
    )

    if (result) {
      this.modelService.updateModel(result)
    }
  }

  undo() {
    // this.modelService.undo()
  }

  redo() {}

  doAction(event) {
    this.toolbarAction$.next(event)
  }

  async uploadTable() {
    const result = await firstValueFrom(
      this._dialog
        .open(ModelUploadComponent, {
          panelClass: 'large',
          data: {
            dataSource: this.modelService.originalDataSource,
            id: this.modelService.model.dataSource.id
          },
          disableClose: true
        } as MatDialogConfig)
        .afterClosed()
    )

    this.refreshSchema()
  }

  tableRemovePredicate(item: CdkDrag<DBTable>) {
    return item.dropContainer.id === 'pac-model-entitysets'
  }

  async dropTable(event: CdkDragDrop<DBTable[]>) {
    const tableName = event.item.data.name
    const confirm = await firstValueFrom(
      this._dialog.open(ConfirmDeleteComponent, { data: { value: tableName } }).afterClosed()
    )
    if (confirm) {
      try {
        await this.modelService.originalDataSource.dropEntity(tableName)
        this.toastrService.success('PAC.ACTIONS.Delete')
        this.refreshDBTables$.next()
      } catch (err) {
        this.toastrService.error(err)
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && (event.key === 's' || event.key === 'S')) {
      this.modelService.saveModel()
      event.preventDefault()
    }
  }

  async clearServerCache() {
    this.clearingServerCache = true
    try {
      await firstValueFrom(this.modelsService.deleteCache(this.model.id))
      this.clearingServerCache = false
      this.toastrService.success('PAC.MODEL.ClearServerCache')
    } catch (err) {
      this.toastrService.error('PAC.MODEL.ClearServerCache', getErrorMessage(err))
      this.clearingServerCache = false
    }
  }

  /**
   * Reset model state
   */
  async reset() {
    this.modelService.initModel(this.model)
  }

  async onDownload() {
    await exportSemanticModel(this.modelsService, this.model.id)
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen
    if (this.isFullscreen) {
      this.appService.requestFullscreen(5)
    } else {
      this.appService.exitFullscreen(5)
    }
  }

  async dropCopilot(event: CdkDragDrop<any[], any[], any>) {
    const data = event.item.data

    if (event.previousContainer.id === 'pac-model-entitysets') {
      // 源表结构或源多维数据集结构
      const entityType = await firstValueFrom(this.modelService.selectOriginalEntityType(data.name))
      this.copilotChat.addMessage({
        role: CopilotChatMessageRoleEnum.User,
        data: {
          columns: [{ name: 'name' }, { name: 'caption' }],
          content: Object.values(entityType.properties)
        },
        content: stringifyTableType(entityType)
      })
    } else if (event.previousContainer.id === 'pac-model__query-results') {
      // 自定义查询结果数据
      this.copilotChat.addMessage({
        role: CopilotChatMessageRoleEnum.User,
        data: {
          columns: data.columns,
          content: data.preview
        },
        content:
          data.columns.map((column) => column.name).join(',') +
          `\n` +
          data.preview.map((row) => data.columns.map((column) => row[column.name]).join(',')).join('\n')
      })
    } else {
      // 其他数据 name
      this.copilotChat.addMessage({
        role: CopilotChatMessageRoleEnum.User,
        content: data.name
      })
    }
  }
}
