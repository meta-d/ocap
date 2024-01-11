import { CommonModule } from '@angular/common'
import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  ElementRef,
  HostBinding,
  inject,
  Input,
  OnInit,
  Renderer2,
  signal,
  ViewChild
} from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { CdkDragEnd } from '@angular/cdk/drag-drop'
import { NgmDrawerTriggerComponent, ResizerModule } from '@metad/ocap-angular/common'
import { NgmDSCoreService, OcapCoreModule } from '@metad/ocap-angular/core'
import { AgentType, isEqual } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { IsDirty, NgMapPipeModule, NxCoreService, ReversePipe } from '@metad/core'
import {
  EmulatedDevice,
  NxStoryService,
  Story,
  StoryOptions,
  StoryPointType,
  WidgetComponentType
} from '@metad/story/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { NxDesignerModule, NxSettingsPanelService } from '@metad/story/designer'
import { injectCalclatedMeasureCommand, injectStoryPageCommand, injectStoryStyleCommand, NxStoryComponent, NxStoryModule } from '@metad/story/story'
import { StoryExplorerModule } from '@metad/story'
import { registerTheme } from 'echarts/core'
import { NGXLogger } from 'ngx-logger'
import { firstValueFrom } from 'rxjs'
import { delay, distinctUntilChanged, filter, map, tap } from 'rxjs/operators'
import { MenuCatalog, registerWasmAgentModel, Store } from '../../../@core'
import { MaterialModule, TranslationBaseComponent } from '../../../@shared'
import { AppService } from '../../../app.service'
import { StoryToolbarComponent } from '../toolbar/toolbar.component'
import { StoryToolbarService } from '../toolbar/toolbar.service'
import { injectCopilotCommand, NgmCopilotEngineService } from '@metad/ocap-angular/copilot'


type ResponsiveBreakpointType = {
  name: string;
  width: number;
  margin: number;
}

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
  selector: 'pac-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
  host: {
    class: 'ngm-story-designer'
  },
  providers: [
    StoryToolbarService,
    NgmDSCoreService,
    NxCoreService,
    NxStoryService,
    NxSettingsPanelService,
    NgmCopilotEngineService
  ]
})
export class StoryComponent extends TranslationBaseComponent implements OnInit, IsDirty {
  ComponentType = WidgetComponentType
  STORY_POINT_TYPE = StoryPointType

  private coreService = inject(NxCoreService)
  public readonly toolbarService = inject(StoryToolbarService)
  public readonly settingsPanelService = inject(NxSettingsPanelService)
  private readonly wasmAgent = inject(WasmAgentService)
  public appService = inject(AppService)
  public storyService = inject(NxStoryService)
  private store = inject(Store)
  private route = inject(ActivatedRoute)
  private _router = inject(Router)
  private logger = inject(NGXLogger)
  private renderer = inject(Renderer2)
  private _cdr = inject(ChangeDetectorRef)

  @Input() storyId: string
  @Input() editable = true

  @ViewChild('toolbar', { static: true }) toolbarComponent: StoryToolbarComponent;
  @ViewChild('storyContainer') storyContainer: ElementRef<any>
  @ViewChild(NxStoryComponent) storyComponent: NxStoryComponent
  @HostBinding('class.ngm-story--fullscreen')
  _fullscreen: boolean
  zIndex = 4

  readonly story = signal<Story>(null)
  readonly models = computed(() => this.story()?.models)
  storyOptions: StoryOptions

  error: string
  emulatedDevice: EmulatedDevice = null
  deviceZoom = null
  designerOpened = false
  hoverSize = null
  // Layout
  ResponsiveBreakpoints: ResponsiveBreakpointType[] = [
    {
      name: 'Mobile S',
      width: 320,
      margin: 320
    },
    {
      name: 'Mobile M',
      width: 375,
      margin: 55 / 2
    },
    {
      name: 'Mobile L',
      width: 425,
      margin: 55 / 2
    },
    {
      name: 'Tablet',
      width: 768,
      margin: 343 / 2
    },
    {
      name: 'Laptop',
      width: 1024,
      margin: 256 / 2
    },
    {
      name: 'Laptop L',
      width: 1440,
      margin: 416 / 2
    },
    {
      name: 'Large Screen',
      width: 2440,
      margin: 1000 / 2
    }
  ]

  readonly watermark$ = this.store.user$.pipe(map((user) => `${user.mobile ?? ''} ${user.email ?? ''}`))
  readonly isDark = toSignal(this.appService.isDark$)
  readonly _isDirty = toSignal(this.storyService.dirty$)
  readonly isMobile = toSignal(this.storyService.isMobile$)
  readonly pageKey = toSignal(this.route.queryParams.pipe(map((queryParams) => queryParams['pageKey'])))
  readonly widgetKey = toSignal(this.route.queryParams.pipe(map((queryParams) => queryParams['widgetKey'])))

  // Story explorer
  showExplorer = signal(false)
  explore = signal(null)

  /**
  |--------------------------------------------------------------------------
  | Copilot
  |--------------------------------------------------------------------------
  */
  #styleCommand = injectStoryStyleCommand(this.storyService)
  #pageCommand = injectStoryPageCommand(this.storyService)

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

  private themeSub = this.storyService.themeChanging$.pipe(delay(300), takeUntilDestroyed(),).subscribe(async ([prev, current]) => {
    const story = await firstValueFrom(this.storyService.story$)
    const key = story.key || story.id
    const echartsTheme = story.options?.echartsTheme

    if (prev === 'light' || !prev) {
      this.renderer.removeClass(this.storyContainer.nativeElement, 'ngm-theme-default')
    }
    if (prev) {
      this.renderer.removeClass(this.storyContainer.nativeElement, 'ngm-theme-' + prev)
      this.renderer.removeClass(this.storyContainer.nativeElement, prev)
      this.renderer.removeClass(this.storyContainer.nativeElement, 'dark')
    }
    if (current) {
      this.renderer.addClass(this.storyContainer.nativeElement, 'ngm-theme-' + current)
      this.renderer.addClass(this.storyContainer.nativeElement, current)
      if (current === 'thin') {
        this.renderer.addClass(this.storyContainer.nativeElement, 'dark')
      }
      if (echartsTheme?.[current]) {
        this.coreService.changeTheme(`${current}-${key}`)
      } else {
        this.coreService.changeTheme(current)
      }
    }
  })

  private _emulatedDeviceSub = this.storyService.storyOptions$
    .pipe(
      map((options) => options?.emulatedDevice),
      takeUntilDestroyed(),
    )
    .subscribe((emulatedDevice) => {
      this.emulatedDevice = emulatedDevice
    })

  private echartsThemeSub = this.storyService.echartsTheme$
    .pipe(
      takeUntilDestroyed(),
      filter(Boolean),
      distinctUntilChanged(isEqual)
    )
    .subscribe(async (echartsTheme) => {
      const story = await firstValueFrom(this.storyService.story$)
      const key = story.key || story.id;
      ['light', 'dark', 'thin'].forEach((theme) => {
        if (echartsTheme?.[theme]) {
          registerTheme(`${theme}-${key}`, echartsTheme[theme])
        }
      })
    })

  private isAuthenticatedSub = this.appService.isAuthenticated$
    .pipe(takeUntilDestroyed())
    .subscribe((isAuthenticated) => {
      this.storyService.setAuthenticated(isAuthenticated)
    })

  constructor() {
    super()

    effect(() => {
      const models = this.models()
      models?.forEach((model) => {
        if (model?.agentType === AgentType.Wasm) {
          registerWasmAgentModel(this.wasmAgent, model)
        }
      })
    })
  }

  ngOnInit(): void {
    const story = this.route.snapshot.data['story']
    if (typeof story === 'string') {
      this.error = story
    } else {
      this.story.set(story)
      if (this.story()) {
        this.appService.setNavigation({ catalog: MenuCatalog.Stories, id: this.story().id, label: this.story().name })
      }
    }
  }

  isDirty(): boolean {
    return this._isDirty()
  }

  openDataExploration(id: string) {
    this._router.navigate([`/models/${id}`])
  }

  onFullscreen(event: boolean) {
    this._fullscreen = event
    if (event) {
      this.appService.requestFullscreen(this.zIndex)
    } else {
      this.appService.exitFullscreen(this.zIndex)
    }
  }

  onEmulatedDevice(event) {
    this.emulatedDevice = event
    this.storyService.updateStoryOptions({ emulatedDevice: event })
    if (!event) {
      this.deviceZoom = { value: 1 }
    }
    this._cdr.detectChanges()
  }

  mouseEnter(size: ResponsiveBreakpointType) {
    this.hoverSize = size
  }
  mouseLeave(size: ResponsiveBreakpointType) {
    this.hoverSize = null
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
    this.storyService.updateStoryOptions({ emulatedDevice: { ...(this.emulatedDevice ?? {} as EmulatedDevice), ...emulatedDevice, name: 'Custom' } })
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

  onToolbarDragEnded(event: CdkDragEnd) {
    this.toolbarComponent.calculateRightSide(event)
  }

  closeExplorer(event) {
    this.showExplorer.set(false)
    this._router.navigate([], {
      relativeTo: this.route,
      queryParams: {explore: null, widgetKey: null},
      queryParamsHandling: 'merge' // remove to replace all query params by provided
    })

    if (event) {
      console.log(`Update story widget: ${this.pageKey()}`, event)

      this.storyService.updateWidget({
        pageKey: this.pageKey(),
        widgetKey: this.widgetKey(),
        widget: event
      })
    }
  }
}
