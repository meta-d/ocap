import { CdkDragEnd } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import {
  Component,
  computed,
  effect,
  ElementRef,
  HostBinding,
  inject,
  Injector,
  Input,
  model,
  OnInit,
  signal,
  viewChild,
  ViewChild
} from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { calcEntityTypePrompt, IsDirty, markdownEntityType, NgMapPipeModule, NxCoreService, ReversePipe } from '@metad/core'
import { NgmDrawerTriggerComponent, ResizerModule } from '@metad/ocap-angular/common'
import { NgmDSCoreService, OcapCoreModule } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { AgentType, isEqual } from '@metad/ocap-core'
import { StoryExplorerModule } from '@metad/story'
import {
  EmulatedDevice,
  NxStoryService,
  Story,
  StoryOptions,
  StoryPointType,
  WidgetComponentType
} from '@metad/story/core'
import { NxDesignerModule, NxSettingsPanelService } from '@metad/story/designer'
import {
  injectMathCommand,
  injectStoryPageCommand,
  injectStoryStyleCommand,
  injectStoryWidgetCommand,
  injectWidgetStyleCommand,
  NxStoryComponent,
  NxStoryModule
} from '@metad/story/story'
import { TranslateModule } from '@ngx-translate/core'
import { registerTheme } from 'echarts/core'
import { NGXLogger } from 'ngx-logger'
import { combineLatest, firstValueFrom, from } from 'rxjs'
import { distinctUntilChanged, filter, map, share, shareReplay, switchMap, tap } from 'rxjs/operators'
import { MenuCatalog, registerWasmAgentModel, Store } from '../../../@core'
import { MaterialModule, TranslationBaseComponent } from '../../../@shared'
import { effectStoryTheme } from '../../../@theme'
import { AppService } from '../../../app.service'
import { StoryToolbarComponent } from '../toolbar/toolbar.component'
import { StoryToolbarService } from '../toolbar/toolbar.service'
import { ResponsiveBreakpoints, ResponsiveBreakpointType } from '../types'
import { NgmCopilotContextService, NgmCopilotContextToken } from '@metad/ocap-angular/copilot'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,

    NgMapPipeModule,
    ReversePipe,

    OcapCoreModule,
    NgmDrawerTriggerComponent,
    ResizerModule,

    NxStoryModule,
    NxDesignerModule,
    StoryToolbarComponent,
    StoryExplorerModule
  ],
  selector: 'pac-story-designer',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
  host: {
    class: 'ngm-story-designer'
  },
  providers: [StoryToolbarService, NgmDSCoreService, NxCoreService, NxStoryService, NxSettingsPanelService,
    {
      provide: NgmCopilotContextToken,
      useClass: NgmCopilotContextService
    }
  ]
})
export class StoryDesignerComponent extends TranslationBaseComponent implements OnInit, IsDirty {
  ComponentType = WidgetComponentType
  STORY_POINT_TYPE = StoryPointType

  // private coreService = inject(NxCoreService)
  public readonly toolbarService = inject(StoryToolbarService)
  public readonly settingsPanelService = inject(NxSettingsPanelService)
  private readonly wasmAgent = inject(WasmAgentService)
  public appService = inject(AppService)
  readonly storyService = inject(NxStoryService)
  readonly #store = inject(Store)
  private route = inject(ActivatedRoute)
  private _router = inject(Router)
  private logger = inject(NGXLogger)
  // private renderer = inject(Renderer2)
  readonly #injector = inject(Injector)
  readonly copilotContext = inject(NgmCopilotContextToken)

  @Input() storyId: string

  @HostBinding('class.editable')
  @Input()
  editable = true

  @ViewChild('toolbar', { static: true }) toolbarComponent: StoryToolbarComponent
  // @ViewChild('storyContainer') storyContainer: ElementRef<any>
  readonly storyContainer = viewChild('storyContainer', { read: ElementRef})
  @ViewChild(NxStoryComponent) storyComponent: NxStoryComponent
  @HostBinding('class.ngm-story--fullscreen')
  _fullscreen: boolean
  zIndex = 4

  readonly story = signal<Story>(null)
  readonly models = computed(() => this.story()?.models)
  storyOptions: StoryOptions

  readonly pinToolbar = this.#store.pinStoryToolbar

  readonly error = signal<string>(null)
  readonly emulatedDevice = signal<EmulatedDevice>(null)
  readonly deviceZoom = signal<{ value: number }>(null)
  readonly emulatedDeviceSizeStyle = computed(() => {
    const emulatedDevice = this.emulatedDevice()
    return emulatedDevice
      ? {
          width: emulatedDevice.width + 'px',
          minWidth: emulatedDevice.width + 'px',
          height: emulatedDevice.height + 'px',
          minHeight: emulatedDevice.height + 'px'
        }
      : {}
  })
  readonly designerOpened = model(false)
  readonly hoverSize = signal<ResponsiveBreakpointType>(null)
  // Layout
  readonly ResponsiveBreakpoints = ResponsiveBreakpoints

  readonly watermark$ = this.#store.user$.pipe(map((user) => `${user.mobile ?? ''} ${user.email ?? ''}`))
  readonly isDark = toSignal(this.appService.isDark$)
  readonly _isDirty = toSignal(this.storyService.dirty$)
  readonly isMobile = toSignal(this.storyService.isMobile$)
  readonly pageKey = toSignal(this.route.queryParams.pipe(map((queryParams) => queryParams['pageKey'])))
  readonly widgetKey = toSignal(this.route.queryParams.pipe(map((queryParams) => queryParams['widgetKey'])))

  // Story explorer
  readonly showExplorer = signal(false)
  readonly explore = signal(null)

  /**
  |--------------------------------------------------------------------------
  | Copilot
  |--------------------------------------------------------------------------
  */
  #styleCommand = injectStoryStyleCommand(this.storyService)
  #pageCommand = injectStoryPageCommand(this.storyService)
  #widgetCommand = injectStoryWidgetCommand(this.storyService)
  // #mathCommand = injectMathCommand(this.storyService)
  #widgetStyleCommand = injectWidgetStyleCommand(this.storyService)

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effect)
  |--------------------------------------------------------------------------
  */
  private queryParamsSub = this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params) => {
    this.logger?.debug(`story 接收的原始 url 参数:`, params)
    this.storyOptions = {}
    if (params.$filters) {
      try {
        const slicers = params.$filters
          .split(' and ')
          .map((sFilter) => sFilter.split(' eq '))
          .map(([name, value]) => {
            return {
              dimension: {
                dimension: name
              },
              members: [
                {
                  value
                }
              ]
            }
          })

        this.logger?.debug(`story 解析后的 filters:`, slicers)
        this.storyOptions.filters = slicers
        // slicers.forEach(item => this.filterBarService.put(item))
      } catch (err) {
        this.logger?.error(`story 解析 url filters 出错:`, err)
      }
    }

    if (params.$language) {
      this.storyOptions.locale = params.$language
    }

    this.showExplorer.set(!!params.explore)
    if (params.explore) {
      this.explore.set(JSON.parse(decodeURIComponent(window.escape(window.atob(params.explore)))))
    }
  })

  private _emulatedDeviceSub = this.storyService.storyOptions$
    .pipe(
      map((options) => options?.emulatedDevice),
      takeUntilDestroyed()
    )
    .subscribe((emulatedDevice) => {
      this.emulatedDevice.set(emulatedDevice)
    })

  private echartsThemeSub = this.storyService.echartsTheme$
    .pipe(takeUntilDestroyed(), filter(Boolean), distinctUntilChanged(isEqual))
    .subscribe(async (echartsTheme) => {
      const story = await firstValueFrom(this.storyService.story$)
      const key = story.key || story.id
      ;['light', 'dark', 'thin'].forEach((theme) => {
        if (echartsTheme?.[theme]) {
          registerTheme(`${theme}-${key}`, echartsTheme[theme])
        }
      })
    })

  constructor() {
    super()

    effect(
      () => {
        this.storyService.setAuthenticated(this.appService.isAuthenticated())
      },
      { allowSignalWrites: true }
    )

    effect(() => {
      const models = this.models()
      models?.forEach((model) => {
        if (model?.agentType === AgentType.Wasm) {
          registerWasmAgentModel(this.wasmAgent, model)
        }
      })
    })

    effectStoryTheme(this.storyContainer)
  }

  ngOnInit(): void {
    const story = this.route.snapshot.data['story']
    if (typeof story === 'string') {
      this.error.set(story)
    } else {
      this.story.set(story)
      if (this.story()) {
        this.appService.setNavigation({ catalog: MenuCatalog.Stories, id: this.story().id, label: this.story().name })
      }
    }

    this.copilotContext.cubes.update(() => this.storyService.storyModelsOptions$.pipe(
      tap(() => console.log(`loading cubes...`)),
      switchMap((dataSources) => combineLatest(dataSources.map((option) => this.storyService.selectDataSource(option.key).pipe(
        switchMap((dataSource) => dataSource.discoverMDCubes()),
        
      ))).pipe(
        map((cubess) => {
          const items = []
          cubess.forEach((cubes, index) => {
            items.push(...cubes.map((cube) => ({ value: {
              dataSource: dataSources[index],
              serizalize: async () => {
                const entityType = await firstValueFrom(this.storyService.selectEntityType({dataSource: dataSources[index].key, entitySet: cube.name}))
                return markdownEntityType(entityType)
              }
            }, key: cube.name, caption: cube.caption })))
          })
          return items
        })
      )),
      shareReplay(1)
    ))
  }

  isDirty(): boolean {
    return this._isDirty()
  }

  openDataExploration(id: string) {
    this._router.navigate([`/models/${id}`])
  }

  toggleToolbarPin() {
    this.#store.setPinStoryToolbar(!this.#store.pinStoryToolbar())
    if (this.#store.pinStoryToolbar()) {
      this.toolbarComponent.resetPosition()
    }
  }

  onFullscreen(event: boolean) {
    this._fullscreen = event
    if (event) {
      this.appService.requestFullscreen(this.zIndex)
    } else {
      this.appService.exitFullscreen(this.zIndex)
    }
  }

  onEmulatedDevice(event: EmulatedDevice) {
    this.emulatedDevice.set(event)
    this.storyService.updateStoryOptions({ emulatedDevice: event })
    if (!event) {
      this.deviceZoom.set({ value: 1 })
    }
  }

  onDeviceZoom(event: { value: number }) {
    this.deviceZoom.set(event)
  }

  mouseEnter(size: ResponsiveBreakpointType) {
    this.hoverSize.set(size)
  }
  mouseLeave(size: ResponsiveBreakpointType) {
    this.hoverSize.set(null)
  }
  selectSize(size: ResponsiveBreakpointType) {
    this.updateEmulatedDevice({
      ...size
    })
  }

  resetScalePanState() {
    this.storyComponent.resetScalePanState()
  }

  updateEmulatedDevice(emulatedDevice: Partial<EmulatedDevice>) {
    this.storyService.updateStoryOptions({
      emulatedDevice: { ...(this.emulatedDevice() ?? ({} as EmulatedDevice)), ...emulatedDevice, name: 'Custom' }
    })
  }
  onEmulatedDeviceWidthChange(width: number) {
    this.updateEmulatedDevice({
      width
    })
  }
  onEmulatedDeviceHeighChange(height: number) {
    this.updateEmulatedDevice({
      height
    })
  }

  openNewPage() {
    this.toolbarComponent.openNewPage()
  }

  onToolbarDragEnded(event: CdkDragEnd) {
    this.toolbarComponent.calculateRightSide(event)
  }

  closeExplorer(event) {
    this.showExplorer.set(false)
    this._router.navigate([], {
      relativeTo: this.route,
      queryParams: { explore: null, widgetKey: null },
      queryParamsHandling: 'merge' // remove to replace all query params by provided
    })

    if (event) {
      this.storyService.updateWidget({
        pageKey: this.pageKey(),
        widgetKey: this.widgetKey(),
        widget: event
      })
    }
  }
}
