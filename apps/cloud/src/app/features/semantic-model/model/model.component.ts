import { CdkDrag, CdkDragDrop, CdkDragRelease } from '@angular/cdk/drag-drop'
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostBinding,
  HostListener,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  computed,
  inject
} from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { FormControl } from '@angular/forms'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog'
import { ActivatedRoute, Router } from '@angular/router'
import { ModelsService, NgmSemanticModel, Store } from '@metad/cloud/state'
import { ConfirmDeleteComponent, ConfirmUniqueComponent } from '@metad/components/confirm'
import { CopilotChatMessageRoleEnum, CopilotEngine } from '@metad/copilot'
import { IsDirty, nonBlank } from '@metad/core'
import {
  NgmCopilotChatComponent,
  injectCopilotCommand,
  injectMakeCopilotActionable,
  provideCopilotDropAction
} from '@metad/ocap-angular/copilot'
import { DBTable, PropertyAttributes, TableEntity, pick } from '@metad/ocap-core'
import { NX_STORY_STORE, NxStoryStore, StoryModel } from '@metad/story/core'
import { NxSettingsPanelService } from '@metad/story/designer'
import { sortBy, uniqBy } from 'lodash-es'
import { nanoid } from 'nanoid'
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
import { ISemanticModel, MenuCatalog, ToastrService, getErrorMessage, routeAnimations, uuid, zodToAnnotations } from '../../../@core'
import { TranslationBaseComponent } from '../../../@shared'
import { AppService } from '../../../app.service'
import { exportSemanticModel } from '../types'
import { ModelUploadComponent } from '../upload/upload.component'
import { CubeSchema, DimensionSchema, createCube, createDimension } from './copilot'
import { ModelCreateEntityComponent } from './create-entity/create-entity.component'
import { ModelCreateTableComponent } from './create-table/create-table.component'
import { SemanticModelService } from './model.service'
import { ModelPreferencesComponent } from './preferences/preferences.component'
import { MODEL_TYPE, SemanticModelEntity, SemanticModelEntityType, TOOLBAR_ACTION_CATEGORY } from './types'
import { stringifyTableType } from './utils'
import { NGXLogger } from 'ngx-logger'

@Component({
  selector: 'ngm-semanctic-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
  providers: [NxSettingsPanelService, SemanticModelService],
  host: {
    class: 'ngm-semanctic-model'
  },
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelComponent extends TranslationBaseComponent implements IsDirty {
  SemanticModelEntityType = SemanticModelEntityType
  TOOLBAR_ACTION_CATEGORY = TOOLBAR_ACTION_CATEGORY

  readonly #store = inject(Store)
  public appService = inject(AppService)
  private modelService = inject(SemanticModelService)
  private modelsService = inject(ModelsService)
  private storyStore = inject<NxStoryStore>(NX_STORY_STORE)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private _dialog = inject(MatDialog)
  private _viewContainerRef = inject(ViewContainerRef)
  private toastrService = inject(ToastrService)
  readonly #logger = inject(NGXLogger)
  readonly destroyRef = inject(DestroyRef)

  /**
  |--------------------------------------------------------------------------
  | Copilot
  |--------------------------------------------------------------------------
  */
  #cubeCommand = injectCopilotCommand({
    name: 'c',
    description: 'New or edit cube',
    examples: [
      this.getTranslation('PAC.MODEL.Copilot.Examples.CreateCubeByTableInfo', { Default: 'Create cube by table info' })
    ],
    systemPrompt: () => {
      const sharedDimensionsPrompt = JSON.stringify(
        this.dimensions().filter((dimension) => dimension.hierarchies?.length).map((dimension) => ({
          name: dimension.name,
          caption: dimension.caption,
          table: dimension.hierarchies[0].tables[0]?.name,
          primaryKey: dimension.hierarchies[0].primaryKey
        }))
      )
      return `Generate cube metadata for MDX. The cube name can't be the same as the table name. Partition the table fields that may belong to the same dimension into the levels of hierarchy of the same dimension.
There is no need to create as dimension with those table fields that are already used in dimensionUsages.
The cube can fill the source field in dimensionUsages only within the name of shared dimensions:
\`\`\`
${sharedDimensionsPrompt}
\`\`\`
`
    },
    actions: [
      injectMakeCopilotActionable({
        name: 'create-model-cube',
        description: 'Should always be used to properly format output',
        argumentAnnotations: [
          {
            name: 'cube',
            type: 'object', // Add or change types according to your needs.
            description: 'The defination of cube',
            required: true,
            properties: zodToAnnotations(CubeSchema)
          }
        ],
        implementation: async (cube: any) => {
          this.#logger.debug(`Execute copilot action 'create-model-cube':`, cube)
          createCube(this.modelService, cube)
          return this.translateService.instant('PAC.MODEL.Copilot.CreatedCube', { Default: 'Created Cube!' })
        }
      })
    ]
  })

  #dimensionCommand = injectCopilotCommand({
    name: 'd',
    description: 'New or edit dimension',
    examples: [
      this.translateService.instant('PAC.MODEL.Copilot.Examples.CreateDimensionByTableInfo', {
        Default: 'Create dimension by table info'
      })
    ],
    systemPrompt: () => {
      return `The dimension name don't be the same as the table name, It is not necessary to convert all table fields into levels. The levels are arranged in order of granularity from coarse to fine, based on the business data represented by the table fields, for example table: product (id, name, product_category, product_family) to levels: [product_family, product_category, name].`
    },
    actions: [
      injectMakeCopilotActionable({
        name: 'create-model-dimension',
        description: 'Should always be used to properly format output',
        argumentAnnotations: [
          {
            name: 'dimension',
            type: 'object', // Add or change types according to your needs.
            description: 'The defination of dimension',
            required: true,
            properties: zodToAnnotations(DimensionSchema)
          }
        ],
        implementation: async (d: any) => {
          this.#logger.debug(`Execute copilot action 'create-model-dimension':`, d)
          createDimension(this.modelService, d)
          return this.translateService.instant('PAC.MODEL.Copilot.CreatedDimension', { Default: 'Created Dimension!' })
        }
      })
    ]
  })

  @ViewChild('tableTemplate') tableTemplate!: TemplateRef<any>
  #entityDropAction = provideCopilotDropAction({
    id: 'pac-model-entitysets',
    implementation: async (event: CdkDragDrop<any[], any[], any>, copilotEngine: CopilotEngine) => {
      this.#logger.debug(`Drop table to copilot chat:`, event)
      const data = event.item.data
      // 获取源表或源多维数据集结构
      const entityType = await firstValueFrom(this.modelService.selectOriginalEntityType(data.name))

      return {
        id: nanoid(),
        role: CopilotChatMessageRoleEnum.User,
        data: {
          columns: [{ name: 'name', caption: '名称' }, { name: 'caption', caption: '描述' }],
          content: Object.values(entityType.properties) as any[]
        },
        content: stringifyTableType(entityType),
        templateRef: this.tableTemplate
      }
    },
  })
  #queryResultDropAction = provideCopilotDropAction({
    id: 'pac-model__query-results',
    implementation: async (event: CdkDragDrop<any[], any[], any>, copilotEngine: CopilotEngine) => {
      this.#logger.debug(`Drop query result to copilot chat:`, event)
      const data = event.item.data
      // 自定义查询结果数据
      return {
        id: nanoid(),
        role: CopilotChatMessageRoleEnum.User,
        data: {
          columns: data.columns,
          content: data.preview
        },
        content:
          data.columns.map((column) => column.name).join(',') +
          `\n` +
          data.preview.map((row) => data.columns.map((column) => row[column.name]).join(',')).join('\n'),
        templateRef: this.tableTemplate
      }
    }
  })

  @ViewChild('copilotChat') copilotChat!: NgmCopilotChatComponent

  @HostBinding('class.pac-fullscreen')
  public isFullscreen = false

  // Model
  searchControl = new FormControl()
  // Actions events
  public readonly editorAction$ = new Subject()
  public readonly toolbarAction$ = new Subject<{ category: TOOLBAR_ACTION_CATEGORY; action: string }>()

  get dbInitialization() {
    return this.modelService.modelSignal()?.dbInitialization
  }
  // Left side menu drawer open state
  sideMenuOpened = true
  // Copilot chat drawer open state
  copilotDrawerOpened = false

  public id$ = this.route.paramMap.pipe(
    startWith(this.route.snapshot.paramMap),
    map((paramMap) => paramMap.get('id')),
    filter(Boolean),
    map(decodeURIComponent),
    distinctUntilChanged(),
    takeUntilDestroyed(),
    shareReplay(1)
  )

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
    takeUntilDestroyed(),
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
  
  public readonly stories$ = this.modelService.stories$
  public readonly currentEntityType$ = this.modelService.currentEntityType$

  public readonly virtualCubes$ = this.modelService.virtualCubes$

  public readonly copilotEnabled$ = this.appService.copilotEnabled$

  private readonly dimensions = toSignal(this.modelService.dimensions$)

  model: ISemanticModel

  // inner states
  clearingServerCache: boolean

  /**
  |--------------------------------------------------------------------------
  | Signals
  |--------------------------------------------------------------------------
  */
  readonly isMobile = this.appService.isMobile
  readonly isWasm$ = toSignal(this.modelService.isWasm$)
  readonly isOlap$ = toSignal(this.modelService.isOlap$)
  readonly modelType$ = toSignal(this.modelService.modelType$)
  readonly writable$ = computed(() => !this.isWasm$() && (this.modelType$() === MODEL_TYPE.OLAP || this.modelType$() === MODEL_TYPE.SQL))
  // readonly _isDirty = toSignal(this.modelService.dirty$)
  readonly tables = toSignal(this.selectDBTables$)

  ngOnInit() {
    this.model = this.route.snapshot.data['storyModel']
    this.appService.setNavigation({ catalog: MenuCatalog.Models, id: this.model.id, label: this.model.name })
    this.modelService.initModel(this.model)
  }

  isDirty(id?: string) {
    return id ? this.modelService.dirty()[id] : this.modelService.isDirty()
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
    // Move items in array
    if (event.previousContainer === event.container) {
      if (event.item.data.type === SemanticModelEntityType.DIMENSION) {
        this.modelService.moveItemInDimensions(event)
      } else if (event.item.data.type === SemanticModelEntityType.CUBE) {
        this.modelService.moveItemInCubes(event)
      } else if (event.item.data.type === SemanticModelEntityType.VirtualCube) {
        this.modelService.moveItemInVirtualCubes(event)
      }
    }
  }

  onDragReleased(event: CdkDragRelease) {
    this.modelService.dragReleased$.next(event.source.dropContainer._dropListRef)
  }

  async createEntity(entity?: SemanticModelEntity) {
    const modelType = this.modelService.modelType()
    const entitySets = this.tables()
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

  createStory() {
    this._dialog.open(ConfirmUniqueComponent, {
      data: {
        title: this.getTranslation('PAC.KEY_WORDS.StoryName', {Default: 'Story Name'}),
      }
    }).afterClosed().pipe(
      filter(nonBlank),
      switchMap((name) =>
        this.storyStore.createStory({
          name: name,
          models: [
            {
              id: this.model.id
            } as StoryModel
          ],
          businessAreaId: this.model.businessAreaId
        })
      )
    ).subscribe({
      next: (story) => {
        if (story) {
          this.openStory(story.id)
        }
      },
      error: (err) => {
        this.toastrService.error(err, 'PAC.MODEL.MODEL.CreateStory')
      }
    })
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
    this.modelService.undo()
  }

  redo() {
    this.modelService.redo()
  }

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
            id: this.modelService.modelSignal().dataSource.id
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
    if (event.metaKey || event.ctrlKey) {
      if (event.shiftKey) {
        if (event.key === 'z' || event.key === 'Z') {
          this.modelService.redo()
          event.preventDefault()
        }
      } else {
        if (event.key === 's' || event.key === 'S') {
          this.modelService.saveModel()
          event.preventDefault()
        } else if (event.key === 'z' || event.key === 'Z') {
          this.modelService.undo()
          event.preventDefault()
        }
      }
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

  // /**
  //  * Drop data on copilot chat:
  //  * 1. table schema
  //  * 2. table data
  //  * 3. name of data
  //  *
  //  * @param event
  //  */
  // async dropCopilot(event: CdkDragDrop<any[], any[], any>) {
  //   const data = event.item.data

  //   if (event.previousContainer.id === 'pac-model-entitysets') {
  //     // 源表结构或源多维数据集结构
  //     const entityType = await firstValueFrom(this.modelService.selectOriginalEntityType(data.name))
  //     this.copilotChat.addMessage({
  //       id: nanoid(),
  //       role: CopilotChatMessageRoleEnum.User,
  //       data: {
  //         columns: [{ name: 'name' }, { name: 'caption' }],
  //         content: Object.values(entityType.properties) as any[]
  //       },
  //       content: stringifyTableType(entityType)
  //     })
  //   } else if (event.previousContainer.id === 'pac-model__query-results') {
  //     // 自定义查询结果数据
  //     this.copilotChat.addMessage({
  //       id: nanoid(),
  //       role: CopilotChatMessageRoleEnum.User,
  //       data: {
  //         columns: data.columns,
  //         content: data.preview
  //       },
  //       content:
  //         data.columns.map((column) => column.name).join(',') +
  //         `\n` +
  //         data.preview.map((row) => data.columns.map((column) => row[column.name]).join(',')).join('\n')
  //     })
  //   } else {
  //     // 其他数据 name
  //     this.copilotChat.addMessage({
  //       id: nanoid(),
  //       role: CopilotChatMessageRoleEnum.User,
  //       content: data.name
  //     })
  //   }
  // }
}
