import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, effect, inject } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { makeTablePrompt, nonBlank } from '@metad/core'
import { NgmCommonModule, NgmTableComponent, ResizerModule, SplitterModule } from '@metad/ocap-angular/common'
import { injectCopilotCommand, injectMakeCopilotActionable } from '@metad/ocap-angular/copilot'
import { OcapCoreModule, effectAction } from '@metad/ocap-angular/core'
import { NgmEntitySchemaComponent } from '@metad/ocap-angular/entity'
import { PropertyHierarchy } from '@metad/ocap-core'
import { NxDesignerModule, NxSettingsPanelService } from '@metad/story/designer'
import { ContentLoaderModule } from '@ngneat/content-loader'
import { TranslateService } from '@ngx-translate/core'
import { MaterialModule, SharedModule, TranslationBaseComponent } from 'apps/cloud/src/app/@shared'
import { Observable, combineLatest, of } from 'rxjs'
import { distinctUntilChanged, filter, map, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators'
import zodToJsonSchema from 'zod-to-json-schema'
import { ToastrService, routeAnimations } from '../../../../@core'
import { AppService } from '../../../../app.service'
import { TablesJoinModule } from '../../tables-join'
import { HierarchySchema } from '../copilot'
import { ModelComponent } from '../model.component'
import { SemanticModelService } from '../model.service'
import { ModelDesignerType, TOOLBAR_ACTION_CATEGORY } from '../types'
import { ModelDimensionService } from './dimension.service'
import { computedAsync } from 'ngxtension/computed-async'
import { isEqual, uniq } from 'lodash-es'

@Component({
  standalone: true,
  selector: 'pac-model-dimension',
  templateUrl: 'dimension.component.html',
  styleUrls: ['dimension.component.scss'],
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ModelDimensionService, NxSettingsPanelService],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    ContentLoaderModule,

    NxDesignerModule,

    OcapCoreModule,
    ResizerModule,
    SplitterModule,
    NgmEntitySchemaComponent,
    NgmCommonModule,
    NgmTableComponent,

    TablesJoinModule
  ]
})
export class ModelDimensionComponent extends TranslationBaseComponent implements OnInit {
  public appService = inject(AppService)
  public modelService = inject(SemanticModelService)
  private modelComponent = inject(ModelComponent)
  private dimensionService = inject(ModelDimensionService)
  public settingsService = inject(NxSettingsPanelService)
  readonly #toastrService = inject(ToastrService)
  readonly #route = inject(ActivatedRoute)
  readonly #router = inject(Router)
  readonly #destroyRef = inject(DestroyRef)
  readonly #translate = inject(TranslateService)

  detailsOpen = false

  public readonly dimension$ = this.dimensionService.dimension$

  /**
  |--------------------------------------------------------------------------
  | Signals
  |--------------------------------------------------------------------------
  */
  public readonly hierarchies = toSignal(this.dimensionService.hierarchies$)
  public readonly dimension = toSignal(this.dimensionService.dimension$)
  readonly isMobile = this.appService.isMobile
  readonly error = toSignal(this.dimensionService.name$.pipe(
    switchMap((entity) => this.modelService.selectOriginalEntityError(entity))
  ))

  readonly tables = computed(() => uniq(this.hierarchies().flatMap((h) => h.tables).flatMap((t) => t.name)), { equal: isEqual })
  readonly tableTypes = computedAsync(() => {
    const tables = this.tables()
    return combineLatest(tables.map((table) => this.modelService.selectOriginalEntityType(table)))
  })
  
  /**
  |--------------------------------------------------------------------------
  | Copilot
  |--------------------------------------------------------------------------
  */
  #createHierarchyCommand = injectCopilotCommand({
    name: 'h',
    description: this.#translate.instant('PAC.MODEL.Copilot.CreateHierarchy', {Default: 'Create a new hierarchy'}),
    examples: [
      this.#translate.instant('PAC.MODEL.Copilot.CreateHierarchy', {Default: 'Create a new hierarchy'})
    ],
    systemPrompt: () => {
      return `你是一名 BI 分析多维模型建模专家，请根据信息为当前维度创建一个新的 Hierarchy， 名称不要与现有名称重复，并且名称要尽量简短。
层次结构中的 Levels 顺序一般按照所使用字段在现实中的含义由上到下（或者叫由粗粒度到细粒度）排列，例如：年份、季度、月份、日期。
当前维度信息为：
\`\`\`
${JSON.stringify(this.dimension())}
\`\`\`
当前维度已使用到的表信息：
\`\`\`
${this.tableTypes().map((tableType) => makeTablePrompt(tableType)).join('\n')}
\`\`\`
`
    },
    actions: [
      injectMakeCopilotActionable({
        name: 'create-model-hierarchy',
        description: 'Should always be used to properly format output',
        argumentAnnotations: [
          {
            name: 'hierarchy',
            type: 'object', // Add or change types according to your needs.
            description: 'The defination of hierarchy',
            required: true,
            properties: (<{ properties: any }>zodToJsonSchema(HierarchySchema)).properties
          }
        ],
        implementation: async (h: PropertyHierarchy) => {
          this.dimensionService.newHierarchy(h)
          return `✅`
        }
      })
    ]
  })

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effects)
  |--------------------------------------------------------------------------
  */
  #paramSub = this.#route.paramMap
    .pipe(
      startWith(this.#route.snapshot.paramMap),
      map((paramMap) => paramMap.get('id')),
      filter(nonBlank),
      map(decodeURIComponent),
      distinctUntilChanged(),
      takeUntilDestroyed()
    )
    .subscribe((id) => {
      this.dimensionService.init(id)
      this.modelService.setCrrentEntity(id)
    })

  #errorSub = effect(() => {
    const error = this.error()
    if (error) {
      this.#toastrService.error(error)
    }
  })

  /**
  |--------------------------------------------------------------------------
  | Methods
  |--------------------------------------------------------------------------
  */
  ngOnInit(): void {
    this.openDesigner()
    this.settingsService.setEditable(true)

    this.modelComponent.toolbarAction$
      .pipe(
        filter(({ category, action }) => category === TOOLBAR_ACTION_CATEGORY.DIMENSION),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe(({ category, action }) => {
        if (action === 'NewHierarchy') {
          this.dimensionService.newHierarchy(null)
        } else if (action === 'RemoveHierarchy') {
          this.dimensionService.removeHierarchy('')
        }
      })
  }

  trackById(i: number, item: PropertyHierarchy) {
    return item.__id__
  }

  openDesignerPanel() {
    this.detailsOpen = true
  }

  readonly openDesigner = effectAction((origin$: Observable<void>) => {
    return origin$.pipe(
      withLatestFrom(this.dimension$),
      switchMap(([, dimension]) =>
        this.settingsService.openDesigner(
          ModelDesignerType.dimension,
          this.dimension$.pipe(
            map((dimension) => ({ modeling: dimension, shared: true, hierarchies: dimension.hierarchies }))
          ),
          dimension.__id__
        )
      ),
      tap((result: { modeling }) => {
        this.dimensionService.update(result.modeling)
      })
    )
  })

  editDimension() {
    this.openDesignerPanel()
    this.openDesigner()
  }

  editHierarchy(key: string) {
    this.openDesignerPanel()
    this.dimensionService.setupHierarchyDesigner(key)
  }

  removeHierarchy(key: string) {
    this.dimensionService.removeHierarchy(key)
  }

  newHierarchy() {
    this.dimensionService.newHierarchy(null)
  }

  duplicateHierarchy(key: string) {
    this.dimensionService.duplicateHierarchy(key)
  }

  navigateTo(id: string) {
    this.#router.navigate([`hierarchy/${id}`], { relativeTo: this.#route })
  }
}
