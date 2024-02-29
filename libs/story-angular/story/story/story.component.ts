import { CdkDrag } from '@angular/cdk/drag-drop'
import { DOCUMENT } from '@angular/common'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Inject,
  Input,
  OnChanges,
  Optional,
  Output,
  QueryList,
  Renderer2,
  SimpleChanges,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
  computed,
  inject,
  signal
} from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Params, Router } from '@angular/router'
import { NgmSmartFilterBarService, OcapCoreModule, isNotEmpty } from '@metad/ocap-angular/core'
import { isNil, omitBlank } from '@metad/ocap-core'
import { ComponentStore } from '@metad/store'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { ConfirmDeleteComponent, ConfirmUniqueComponent } from '@metad/components/confirm'
import { NgmTransformScaleDirective, NxCoreModule, camelCaseObject, nonNullable } from '@metad/core'
import {
  ComponentSettingsType,
  MoveDirection,
  NxStoryService,
  PageHeaderLabelEnum,
  Story,
  StoryFilterBar,
  StoryOptions,
  StoryPoint,
  WidgetComponentType,
  componentStyling
} from '@metad/story/core'
import { NxSettingsPanelService } from '@metad/story/designer'
import { ISmartFilterBarOptions } from '@metad/story/widgets/filter-bar'
import { startsWith } from 'lodash-es'
import { NGXLogger } from 'ngx-logger'
import { NgxPopperjsModule, NgxPopperjsPlacements, NgxPopperjsTriggers } from 'ngx-popperjs'
import { BehaviorSubject, EMPTY, Observable, combineLatest, firstValueFrom, interval, merge } from 'rxjs'
import {
  combineLatestWith,
  debounce,
  delay,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators'
import { StorySharesComponent } from '../shares/shares.component'
import { NxStoryPointComponent } from '../story-point/story-point.component'
import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { NxStorySharedModule } from '../shared.module'
import { CdkMenuModule } from '@angular/cdk/menu'
import { HammerModule } from '@angular/platform-browser'
import { TrialWatermarkComponent } from '@metad/components/trial-watermark'
import { NgmCommonModule } from '@metad/ocap-angular/common'

/**
 * 暂时将 providers 放在此 Story 组件上, 后续考虑更好的位置
 */
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
  host: {
    class: 'ngm-story'
  },
  providers: [NgmSmartFilterBarService],
  imports: [
    NxStorySharedModule,
    CdkMenuModule,
    HammerModule,
    TranslateModule,
    TrialWatermarkComponent,
    NgxPopperjsModule,
    NxCoreModule,

    // OCAP Modules
    OcapCoreModule,
    NgmCommonModule,

    // Local modules
    StorySharesComponent,
    NgmTransformScaleDirective,
    NxStoryPointComponent
  ]
})
export class NxStoryComponent extends ComponentStore<Story> implements OnChanges, AfterViewInit {
  ComponentType = WidgetComponentType
  NgxPopperjsTriggers = NgxPopperjsTriggers
  NgxPopperjsPlacements = NgxPopperjsPlacements
  PageHeaderLabelEnum = PageHeaderLabelEnum

  private _renderer = inject(Renderer2)
  private _cdr = inject(ChangeDetectorRef)
  private readonly _dialog = inject(MatDialog)
  private readonly _viewContainerRef = inject(ViewContainerRef)

  @Input() get story(): Story {
    return this.story$.value
  }
  set story(value) {
    this.story$.next(value)
  }
  private story$ = new BehaviorSubject<Story>(null)

  @Input() get editable(): boolean {
    return this._editable()
  }
  set editable(value: string | boolean) {
    this._editable.set(coerceBooleanProperty(value))
  }
  private readonly _editable = signal(false)

  /**
   * 默认打开的 Page
   */
  @Input() pageKey: string
  /**
   * 聚焦 Widget
   */
  @Input() widgetKey: string
  @Input() watermark: string
  @Input() get dark() {
    return this.dark$.value
  }
  set dark(value) {
    this.dark$.next(value)
  }
  private dark$ = new BehaviorSubject(null)

  /**
   * 自定义选项, 运行时覆盖 Story Options
   */
  @Input() get options(): StoryOptions {
    return this.options$.value
  }
  set options(value) {
    this.options$.next(value)
  }
  private options$ = new BehaviorSubject<StoryOptions>(null)

  @Input() filterBarOpened = false

  @Output() selectedStoryPointChange = new EventEmitter()
  @Output() filterBarOpenedChange = new EventEmitter()
  @Output() saved = new EventEmitter()
  @Output() dataExploration = new EventEmitter()

  @ViewChildren(NxStoryPointComponent) storyPointComponents: QueryList<NxStoryPointComponent>
  @ViewChild('panDragHandler', { read: CdkDrag }) cdkDrag: CdkDrag

  @HostBinding('class.ngm-story--fullscreen')
  _fullscreen: boolean

  readonly preferences = toSignal(this.storyService.preferences$)


  // State Query
  readonly currentStory$ = this.storyService.story$
  readonly filterBar$ = this.storyService.filterBar$
  readonly filterBar = toSignal(this.storyService.filterBar$)
  // readonly filterBarOptions$ = this.storyService.filterBar$.pipe(map((filterBar) => filterBar?.options))
  readonly filterBarStyling$ = this.storyService.filterBar$.pipe(map((filterBar) => filterBar?.styling))

  readonly preferences$ = this.storyService.preferences$
  
  readonly tabBar$ = this.storyService.preferences$.pipe(map((preferences) => preferences?.story?.tabBar))
  readonly tabHidden = toSignal(this.tabBar$.pipe(map((tabBar) => tabBar === 'hidden' || tabBar === 'point')))

  readonly tabIsPoint = computed(() => this.preferences()?.story?.tabBar === 'point')
  
  readonly isMobile$ = this.storyService.isMobile$
  readonly pageStyle$ = this.storyService.preferences$.pipe(
    map((preferences) => componentStyling(preferences?.pageStyling) ?? preferences?.page?.styles) // 向后兼容
  )

  readonly displayPoints$ = this.storyService.displayPoints$
  readonly showStoryFilterBar$ = this.storyService.storyOptions$.pipe(
    map((options) => options?.hideStoryFilterBar),
    map((value) => value === false)
  )

  public readonly pageHeaderShowLabel = computed(() => this.preferences()?.story?.pageHeaderShowLabel)
  public readonly pageHeaderPosition = computed(() => this.preferences()?.story?.pageHeaderPosition)
  public readonly pageHeaderAlignTabs = computed(() => this.preferences()?.story?.pageHeaderAlignTabs ?? 'start')
  public readonly pageHeaderStretchTabs = computed(() => this.preferences()?.story?.pageHeaderStretchTabs ?? false)
  public readonly pageHeaderFitInkBarToContent = computed(() => this.preferences()?.story?.pageHeaderFitInkBarToContent ?? false)

  public currentPageIndex$ = this.storyService.currentIndex$
  public currentPageKey = toSignal(this.storyService.currentPageKey$)

  public readonly storySizeStyles = toSignal(this.storyService.storySizeStyles$)

  public readonly scaleStyles$ = this.storyService.storyOptions$.pipe(
    map((options) => options?.scale),
    distinctUntilChanged(),
    map((scale) => {
      return scale
        ? {
            transform: `scale(${scale / 100})`,
            'transform-origin': 'left top'
          }
        : {}
    })
  )
  readonly storyStyle$ = combineLatest([
    this.storyService.preferences$.pipe(map((preferences) => componentStyling(preferences?.storyStyling))),
    this.scaleStyles$
  ]).pipe(
    map(([storyStyling, scaleStyles]) => {
      return {
        ...storyStyling,
        ...scaleStyles
      }
    })
  )

  public readonly isPanMode$ = this.storyService.isPanMode$
  public readonly disablePanMode$ = this.isPanMode$.pipe(map((value) => !value))

  /**
  |--------------------------------------------------------------------------
  | Signals
  |--------------------------------------------------------------------------
  */
  readonly enableWatermark$ = toSignal(this.storyService.preferences$.pipe(
    map((preferences) => preferences?.story?.enableWatermark)
  ))
  readonly watermarkOptions$ = toSignal(this.storyService.preferences$.pipe(
    map((preferences) => {
      const watermarkOptions = camelCaseObject(omitBlank(preferences?.story?.watermarkOptions))
      return {
        ...(watermarkOptions ?? {}),
        text: watermarkOptions?.text || this.watermark
      }
    })
  ))

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effect)
  |--------------------------------------------------------------------------
  */
  private _storySavedSubscriber = this.storyService
    .onSaved()
    .pipe(debounce(() => interval(1000)), takeUntilDestroyed())
    .subscribe(() => this.saved.emit())
  // 这里的 resize 还有用吗 ?
  private _resizeSubscriber = merge(
    this.selectedStoryPointChange
    // this.storyFilterDrawerChange
    // this.storyDesignerDrawerChange
  )
    .pipe(withLatestFrom(this.storyService.currentPageKey$), takeUntilDestroyed())
    .subscribe(([event, currentId]) => {
      // console.warn(`resize selected story page layout`)
      // TODO 需要重构成更好的方式
      this.storyPointComponents
        .toArray()
        .find((item) => item.point.id === currentId)
        ?.resize()
    })
  private _intentSubscriber = this.storyService
    .onIntent()
    .pipe(filter((intent) => intent?.semanticObject === 'StoryPoint'), takeUntilDestroyed())
    .subscribe((intent) => {
      // this.selectedStoryPointKey = intent.action
      // let filters = this.currentPoint.filters || []
      if (intent.parameters) {
        Object.keys(intent.parameters).forEach((key) => {
          // filters = putFilter(filters, new NxFilter({dimension: key}, intent.parameters[key]))
        })
      }
      // this.currentPoint.filters = filters
      this.storyService.setCurrentPageKey(intent.action)
    })
  private _storyFiltersSubscriber = this.storyService.filters$.pipe(filter(isNotEmpty), takeUntilDestroyed()).subscribe((filters) => {
    this.logger?.debug(`Story全局固定过滤器:`, filters)
    // filters.forEach(item => this.filterBarService.put(item))
  })
  private _currentPageKeySubscriber = this.storyService.currentPageKey$
    .pipe(filter(nonNullable), takeUntilDestroyed())
    .subscribe(async (pageKey) => {
      const currentIndex = await firstValueFrom(this.storyService.currentIndex$)
      if ((currentIndex !== 0 && pageKey) || this.route.snapshot.queryParams['pageKey']) {
        const queryParams: Params = { pageKey }
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: queryParams,
          queryParamsHandling: 'merge' // remove to replace all query params by provided
        })
      }
    })
  private _storySub = this.story$
    .pipe(
      filter(Boolean),
      distinctUntilChanged(),
      delay(100),
      tap((story) => {
        this.storyService.setStory(story)
        setTimeout(() => {
          if (!isNil(this.pageKey)) {
            this.storyService.setCurrentPageKey(this.pageKey)
          } else {
            this.storyService.setCurrentIndex(0)
          }
        })
      }),
      combineLatestWith(this.options$),
      takeUntilDestroyed()
    )
    .subscribe(([story, options]) => {
      this.storyService.updateStoryOptions({
        ...(options ?? {})
      })
    })

  private advancedStyleSub = this.storyService.advancedStyle$.pipe(takeUntilDestroyed()).subscribe({
    next: (result) => {
      result = result?.replace(new RegExp(':host', 'g'), `[${this._nghost}]`)
      if (!isNil(this.style)) {
        this._renderer.removeChild(this._elementRef.nativeElement, this.style)
      }
      this.style = this.document.createElement('style')
      this.style.type = 'text/css'
      this.style.appendChild(this.document.createTextNode(result))
      this._renderer.appendChild(this._elementRef.nativeElement, this.style)
    },
    error: (err) => {
      console.error(err)
    }
  })

  private backgroundSub = this.storyService.storyOptions$
    .pipe(map((options) => options?.preferences?.storyStyling?.backgroundColor), takeUntilDestroyed())
    .subscribe((backgroundColor) => {
      if (backgroundColor) {
        this._renderer.setStyle(this._elementRef.nativeElement, 'background-color', backgroundColor)
      }
    })

  style: any
  private _nghost: string

  constructor(
    public storyService: NxStoryService,
    private readonly translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document,
    private _elementRef: ElementRef,
    @Optional()
    public settingsService?: NxSettingsPanelService,
    @Optional()
    private logger?: NGXLogger
  ) {
    super({} as Story)
  }

  ngOnChanges({ editable, pageKey, filterBarOpened }: SimpleChanges): void {
    if (editable) {
      this.storyService.setEditable(editable.currentValue)
    }
    if (pageKey) {
      if (pageKey.currentValue) {
        this.storyService.setCurrentPageKey(pageKey.currentValue)
      } else {
        this.storyService.setCurrentIndex(0)
      }
    }

    if (filterBarOpened) {
      this.storyService.updateStoryFilterBar({
        opened: filterBarOpened.currentValue
      })
    }
  }

  ngAfterViewInit(): void {
    const attrs = this._elementRef.nativeElement.attributes
    for (let i = attrs.length - 1; i >= 0; i--) {
      if (startsWith(attrs[i].name, '_nghost')) {
        this._nghost = attrs[i].name
        break
      }
    }
  }

  trackByName(index: number, el: any) {
    return el.name
  }

  trackByKey(index: number, el: StoryPoint) {
    return el.key
  }

  onSelectedTabChange(event) {
    this.selectedStoryPointChange.emit(event)
  }

  onSelectedIndex(event) {
    this.storyService.setCurrentIndex(event as number)
  }

  openDialog() {
    const dialogRef = this._dialog.open(ConfirmUniqueComponent)
    return dialogRef.afterClosed()
  }

  /**
   * 新创建 Story Widget
   */
  async createWidget(type: string) {
    const name = await firstValueFrom(this.openDialog())
    if (name) {
      this.storyService.createStoryWidget({
        component: type,
        name
      })
    }
  }

  async onDrawerOpenedChange(opened: boolean) {
    this.filterBarOpenedChange.emit(opened)
  }

  /**
   * Open designer for filter bar
   */
  readonly openStoryFilterBar = this.effect((origin$: Observable<void>) => {
    return origin$.pipe(
      withLatestFrom(this.storyService.id$),
      switchMap(
        ([, id]) =>
          this.settingsService?.openTabsDesigner(id, [
            {
              componentType: ComponentSettingsType.StoryFilterBar,
              label: 'STORY_DESIGNER.BUILDER_TITLE',
              icon: 'handyman',
              model: this.filterBar$.pipe(map((filterBar) => filterBar ?? {}))
            },
            {
              componentType: ComponentSettingsType.StoryFilterBar + '/Style',
              label: 'STORY_DESIGNER.STYLING_TITLE',
              icon: 'format_paint',
              model: this.filterBarStyling$.pipe(map((filterBar) => filterBar ?? {}))
            }
          ]) ?? EMPTY
      ),
      tap((result: [StoryFilterBar, StoryFilterBar['styling']]) => {
        const [filterBar, styling] = result
        if (filterBar || styling) {
          const options = { ...(filterBar ?? {}) }
          if (styling) {
            options.styling = styling
          }
          this.storyService.updateStoryFilterBar(options)
        }
      })
    )
  })

  async openShare(point: StoryPoint) {
    const story = await firstValueFrom(this.currentStory$)
    const isAuthenticated = await firstValueFrom(this.storyService.isAuthenticated$)
    await firstValueFrom(
      this._dialog
        .open(StorySharesComponent, {
          viewContainerRef: this._viewContainerRef,
          data: {
            access: story.access,
            visibility: story.visibility,
            isAuthenticated,
            id: story.id,
            point
          }
        })
        .afterClosed()
    )
  }

  onStoryFilterBarOptionsChange(options: ISmartFilterBarOptions) {
    this.storyService.updateStoryFilterBar({ options })
  }

  /**
   * 删除当前故事点
   */
  async removeStoryPoint(event: StoryPoint) {
    const information = await firstValueFrom(
      this.translateService.get('Story.Common.ConfirmDeleteInfo', {
        Default: 'It is not deleted from the server until it is actually saved'
      })
    )
    const confirm = await firstValueFrom(
      this._dialog
        .open(ConfirmDeleteComponent, {
          data: { value: event.name, information }
        })
        .afterClosed()
    )

    if (confirm) {
      this.storyService.removeStoryPoint(event.key)
    }
  }

  duplicateStoryPoint(key: string) {
    this.storyService.duplicateStoryPoint(key)
  }

  toggleStoryPointHidden(key: string) {
    this.storyService.toggleStoryPointHidden(key)
  }

  move(point: StoryPoint, direction: MoveDirection) {
    this.storyService.move({ direction, key: point.key })
  }

  saveStoryPoint(key: string) {
    this.storyService.saveStoryPoint(key)
  }

  private swipeCoord: [number, number]
  private swipeTime: number
  swipe(e: TouchEvent, when: string) {
    const coord: [number, number] = [e.changedTouches[0].clientX, e.changedTouches[0].clientY]
    const time = new Date().getTime()

    if (when === 'start') {
      this.swipeCoord = coord
      this.swipeTime = time
    } else if (when === 'end') {
      const direction = [coord[0] - this.swipeCoord[0], coord[1] - this.swipeCoord[1]]
      const duration = time - this.swipeTime

      if (
        duration < 500 && //
        Math.abs(direction[0]) > 30 && // Long enough
        Math.abs(direction[0]) > Math.abs(direction[1] * 3)
      ) {
        this.storyService.swipe(direction[0] < 0 ? 'right' : 'left')
      }
    }
  }

  refresh(force = false) {
    this.storyService.refresh(force)
  }

  async slidePrev(loop = false) {
    this.storyService.swipe('left', loop)
  }

  async slideNext(loop = false) {
    this.storyService.swipe('right', loop)
  }

  resetScalePanState() {
    this.cdkDrag?.reset()
    this.storyService.updateStoryOptions({ scale: null })
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Alt + ArrowLeft
    // Alt + ArrowRight
    if (event.altKey) {
      if (event.key === 'ArrowLeft') {
        this.slidePrev()
      } else if (event.key === 'ArrowRight') {
        this.slideNext()
      }
    }
  }
}
