import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  Output,
  Renderer2,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  inject
} from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Params, Router } from '@angular/router'
import { NgmSmartFilterBarService } from '@metad/ocap-angular/core'
import { assignDeepOmitBlank, omit, omitBlank } from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { ConfirmModule, ConfirmUniqueComponent } from '@metad/components/confirm'
import { NxCoreModule, nonNullable, uploadYamlFile } from '@metad/core'
import {
  ComponentSettingsType,
  MoveDirection,
  NxStoryService,
  Story,
  StoryPageSize,
  StoryPoint,
  StoryPointType,
  StoryWidget,
  WidgetComponentType,
  componentStyling
} from '@metad/story/core'
import { NxSettingsPanelService } from '@metad/story/designer'
import { FlexItemType, FlexLayout, ResponsiveService } from '@metad/story/responsive'
import {
  CompactType,
  DisplayGrid,
  GridType,
  GridsterComponent,
  GridsterComponentInterface,
  GridsterConfig,
  GridsterItem,
  GridsterModule,
} from 'angular-gridster2'
import { cloneDeep, isObject, merge, pick } from 'lodash-es'
import { BehaviorSubject, EMPTY, Observable, combineLatest, firstValueFrom } from 'rxjs'
import {
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
  withLatestFrom
} from 'rxjs/operators'
import { NxStoryPointService } from '../story-point.service'
import { StorySharesComponent } from '../shares/shares.component'
import { NxStorySharedModule } from '../shared.module'
import { OverlayModule } from '@angular/cdk/overlay'
import { CdkMenuModule } from '@angular/cdk/menu'
import { TranslateModule } from '@ngx-translate/core'
import { ContentLoaderModule } from '@ngneat/content-loader'
import { NgxPopperjsModule } from 'ngx-popperjs'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { NxStoryWidgetComponent } from "../story-widget/story-widget.component";
import { NxStoryResponsiveModule } from "../../responsive/responsive.module";
import { toSignal } from '@angular/core/rxjs-interop'

@UntilDestroy({ checkProperties: true })
@Component({
    standalone: true,
    selector: 'ngm-story-point',
    templateUrl: './story-point.component.html',
    styleUrls: ['./story-point.component.scss'],
    host: {
        class: 'ngm-story-point'
    },
    providers: [NxStoryPointService, NgmSmartFilterBarService, ResponsiveService],
    imports: [
        NxStorySharedModule,
        OverlayModule,
        CdkMenuModule,
        ConfirmModule,
        TranslateModule,
        ContentLoaderModule,
        NgxPopperjsModule,
        NxCoreModule,
        NgmCommonModule,
        NxStoryWidgetComponent,
        NxStoryResponsiveModule,
        GridsterModule
    ]
})
export class NxStoryPointComponent implements OnChanges {
  STORY_POINT_TYPE = StoryPointType
  ComponentType = WidgetComponentType

  private _renderer = inject(Renderer2)
  private readonly _dialog = inject(MatDialog)
  private readonly _viewContainerRef = inject(ViewContainerRef)
  private smartFilterBar = inject(NgmSmartFilterBarService)
  public settingsService? = inject(NxSettingsPanelService, {optional: true})

  @Input() story: Story
  @Input() key: string
  get point(): StoryPoint {
    return this.storyPointService.storyPoint ?? ({} as StoryPoint)
  }

  @Input() get editable(): boolean {
    return this._editable$.value
  }
  set editable(value) {
    this._editable$.next(value)
  }
  private _editable$ = new BehaviorSubject<boolean>(false)

  @Input() get opened(): boolean {
    return this._opened$.getValue()
  }
  set opened(value) {
    this._opened$.next(value)
  }
  private _opened$ = new BehaviorSubject<boolean>(false)

  /**
   * 聚焦 Widget
   */
  @HostBinding('class.ngm-story__focus')
  @Input()
  focus: string

  @Input() isFirst = false
  @Input() isLast = false

  @Output() resizeEvent = new EventEmitter()

  @ViewChild(GridsterComponent) gridster: GridsterComponent
  // @ViewChildren(NxStoryWidgetComponent) widgets: QueryList<NxStoryWidgetComponent>
  @ViewChild('defaultTemplate') defaultTemplate: TemplateRef<Element>
  
  get gridColWidth() {
    return this.gridster.curColWidth
  }
  get gridRowHeight() {
    return this.gridster.curRowHeight
  }

  public dirty = false
  public gridOptions: GridsterConfig

  @HostBinding('class.ngm-story-point__multi-layer')
  get allowMultiLayer(): boolean {
    return this.gridOptions?.allowMultiLayer
  }
  get maxLayerIndex() {
    return this.gridOptions?.maxLayerIndex
  }

  private closedQuickStart$ = new BehaviorSubject<boolean>(false)

  public readonly storyPoint$ = this.storyPointService.storyPoint$
  public readonly storyPoint = toSignal(this.storyPointService.storyPoint$)

  public readonly quickStart$ = combineLatest([
    this.storyPointService.isEmpty$,
    this._editable$,
    this.closedQuickStart$
  ]).pipe(map(([isEmpty, editable, closedQuickStart]) => editable && isEmpty && !closedQuickStart))
  readonly widgets$ = this.storyPointService.widgets$.pipe(
    map((widgets) =>
      widgets?.map((widget) => ({
        ...widget,
        position: {
          ...widget.position,
          key: widget.key
        }
      }))
    )
  )

  public readonly unfetched$ = this.storyPointService.fetched$.pipe(map((fetched) => !fetched)) // 未获取到数据

  readonly responsive$ = combineLatest([
    this.storyPointService.responsive$.pipe(filter(nonNullable)),
    this.storyPointService.widgets$.pipe(filter(nonNullable))
  ]).pipe(
    map(([responsive, widgets]) => {
      responsive = cloneDeep(responsive)
      setDefaultTemplate(responsive, this.defaultTemplate, widgets)
      return responsive
    })
  )

  /**判断是移动端还是PC端 */
  public readonly isMobile$ = this.storyService.isMobile$
  public readonly mobileDragDisable$ = this._editable$.pipe(map((editable) => !editable))
  public readonly stylingCanvas$ = this.storyPointService.styling$.pipe(map((styling) => styling?.canvas))

  public readonly isCopyWidgetSelected$ = this.storyService.copySelectedWidget$

  currentWidget: StoryWidget
  currentComponentType: WidgetComponentType | string
  resizingWidgetKey: string
  private defaultGridOptions: GridsterConfig = {
    gridType: GridType.Fixed,
    setGridSize: true,
    fixedColWidth: 100,
    fixedRowHeight: 100,
    minCols: 10,
    minRows: 10,
    maxCols: 1000,
    maxRows: 1000,
    maxItemCols: 1000,
    maxItemRows: 1000,
    compactType: CompactType.None,
    pushItems: true,
    swap: false,
    mobileBreakpoint: 340,
    useBodyForBreakpoint: true,
    draggable: {
      delayStart: 100,
      enabled: true,
      // ignoreContentClass: 'gridster-item-content',
      // ignoreContent: true,
      // dragHandleClass: 'ngm-drag-handler',
      dropOverItems: false,
      dropOverItemsCallback: NxStoryPointComponent.overlapEvent
    },
    disableScrollVertical: true,
    resizable: {
      enabled: true,
      start: (item, gridsterItem, event) => {
        this.resizingWidgetKey = item.key
      },
      stop: (item, gridsterItem, event) => {
        this.resizingWidgetKey = null
      }
    },
    defaultLayerIndex: 1,
    maxLayerIndex: 10,
    baseLayerIndex: 0,
    enableEmptyCellDrag: false,
    enableEmptyCellDrop: true,
    enableOccupiedCellDrop: true
  }

  public readonly gridOptions$ = combineLatest([
    this.storyPointService.styling$.pipe(startWith(null)),
    combineLatest([
      this.storyPointService.gridOptions$,
      this.storyService.preferences$.pipe(
        // 向后兼容
        map((preferences) => preferences?.defaultGridOptions ?? preferences?.page?.defaultGridOptions)
      )
    ]).pipe(
      map(([gridOptions, defaultGridOptions]) =>
        assignDeepOmitBlank({}, assignDeepOmitBlank(defaultGridOptions, gridOptions))
      )
    ),
    this.storyService.creatingWidget$.pipe(
      map(nonNullable),
      distinctUntilChanged()
    ),
    this._editable$
  ]).pipe(
    map(([styling, options, isCreatingWidget, editable]) => {
      let defaultGridOptions = { ...this.defaultGridOptions }
      if (styling?.pageSize?.type === StoryPageSize.Dynamic) {
        defaultGridOptions = merge(defaultGridOptions, {
          gridType: GridType.Fixed,
          setGridSize: true,
          fixedColWidth: 15,
          fixedRowHeight: 15
        })
      }
      const _options = editable
        ? {
            draggable: {
              enabled: true
            },
            resizable: {
              enabled: true
            },
            enableEmptyCellDrag: isCreatingWidget
          }
        : {
            draggable: {
              enabled: false
            },
            resizable: {
              enabled: false
            },
            displayGrid: DisplayGrid.None
          }

      return merge(
        {
          emptyCellDropCallback: this.emptyCellClick.bind(this),
          emptyCellDragCallback: this.emptyCellClick.bind(this)
        },
        defaultGridOptions,
        omitBlank(options),
        _options
      )
    }),
    tap((options) => (this.gridOptions = options)),
    untilDestroyed(this),
    shareReplay(1)
  )

  public readonly multiLayer$ = this.gridOptions$.pipe(
    map((options) => pick(options, 'allowMultiLayer', 'defaultLayerIndex', 'maxLayerIndex', 'baseLayerIndex'))
  )

  // nativeElement.scrollTop
  private _scrollTop = 0
  private _scrollLeft = 0

  static overlapEvent(source: GridsterItem, target: GridsterItem, grid?: GridsterComponentInterface) {
    console.log('overlap', source, target, grid)
  }

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effect)
  |--------------------------------------------------------------------------
  */
  private stylingSub = this.storyPointService.styling$.subscribe((styling) => {
    const pageStyles = componentStyling(styling)
    Object.keys(pageStyles).forEach((key) => {
      this._renderer.setStyle(this._elementRef.nativeElement, key, pageStyles[key])
    })
  })

  private stylingCanvasSub = this.stylingCanvas$.pipe(filter((value) => isObject(value))).subscribe((styling) => {
    Object.keys(styling).forEach((key) => {
      this._renderer.setStyle(this._elementRef.nativeElement, key, styling[key])
    })
  })

  private flexLayoutSub = this.responsiveService.flexLayoutChange$.subscribe((value: FlexLayout) => {
    this.storyPointService.refactFlexLayout(value)
  })

  // filters 改变并且此页面打开后刷新
  private filterSub = this.storyPointService.filters$
    .pipe(
      switchMap((filters) =>
        this._opened$.pipe(
          filter((opened) => opened),
          take(1),
          map(() => filters)
        )
      )
    )
    .subscribe((filters) => {
      this.filterBarService.change(filters)
      this.filterBarService.go()
    })
  // Dirty
  private dirtySub = this.storyPointService.isDirty$.subscribe((dirty) => {
    this.dirty = this.editable && dirty
  })
  // Opened
  private openedSub = this._opened$.subscribe((open) => {
    this.storyPointService.active(open)
    if (open) {
      // 打开页面时初始化此页面设置
      this.openPageDesigner()
    }
  })
  // Responsive
  private responsiveWidgetSelectedSub = this.responsiveService.selected$.subscribe((key: string) => {
    this.storyPointService.setCurrentFlexLayoutKey(key)
    if (key) {
      this.openResponsiveDesigner(key)
    }
  })

  constructor(
    public storyService: NxStoryService,
    private storyPointService: NxStoryPointService,
    private filterBarService: NgmSmartFilterBarService,
    private responsiveService: ResponsiveService,
    private router: Router,
    private route: ActivatedRoute,
    private _elementRef: ElementRef,
    private _cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges({ key }: SimpleChanges): void {
    if (key?.currentValue) {
      this.storyPointService.init(key.currentValue)
    }
  }

  onGridsterItemChange({ item }: { item: GridsterItem }, widget: StoryWidget) {
    this.storyPointService.updateWidgetLayer({ key: widget.key, position: { ...widget.position, ...item } })
  }

  async emptyCellClick(event: MouseEvent, item: GridsterItem) {
    const dataSettings = await this.storyService.getDefaultDataSource()
    if (event.type === 'drop') {
      const creatingWidget = JSON.parse((<DragEvent>event).dataTransfer.getData('json'))
      this.storyPointService.createWidget({
        ...creatingWidget,
        dataSettings: {
          ...dataSettings,
          ...(creatingWidget.dataSettings ?? {}),
        },
        position: {
          x: item.x,
          y: item.y,
          cols: Math.round(creatingWidget.position.width / this.gridColWidth),
          rows: Math.round(creatingWidget.position.height / this.gridRowHeight)
        },
      })
    } else {
      this.storyPointService.createWidget({
        ...(this.storyService.creatingWidget ?? {}),
        dataSettings: {
          ...dataSettings,
          ...(this.storyService.creatingWidget?.dataSettings ?? {}),
        },
        position: {
          x: item.x,
          y: item.y,
          cols: item.cols,
          rows: item.rows
        }
      })
      this.storyService.setCreatingWidget(null)
    }
  }

  trackWidget(index: number, el: StoryWidget) {
    return el.key
  }

  refresh() {
    this.smartFilterBar.go()
  }

  /**
   * 重新计算页面布局
   */
  resize() {
    this.gridster?.onResize()
  }

  onResize(event) {
    this.resize()
  }

  /**
   * 响应 Widget 组件全屏变化
   */
  onFullscreenChange(event: boolean, widget: StoryWidget) {
    if (!widget) {
      return
    }
    if (!event && this.storyPointService.widgets?.find((item) => item.key !== widget?.key && item.fullscreen)) {
      return
    }

    if (event) {
      this._scrollTop = this._elementRef.nativeElement.scrollTop
      this._scrollLeft = this._elementRef.nativeElement.scrollLeft
      this._elementRef.nativeElement.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })

      setTimeout(() => {
        this.storyPointService.toggleFullscreen({ key: widget.key, fullscreen: event })
        this._cdr.markForCheck()
        this._cdr.detectChanges()
      })
    } else {
      this.currentWidget = null
      setTimeout(() => {
        this._elementRef.nativeElement.scrollTo({
          top: this._scrollTop,
          left: this._scrollLeft,
          behavior: 'smooth'
        })
      })

      this.storyPointService.toggleFullscreen({ key: widget.key, fullscreen: event })
      this._cdr.markForCheck()
      this._cdr.detectChanges()
    }
  }

  /**
   * 点击 Widget
   * 1. active selcted this widget
   * 2. unfocus other widgets
   *
   * @param event click event
   * @param widget widget data
   * @param widgetComponent widget component
   */
  onWidgetItemClick(event, widget: StoryWidget, widgetComponent) {
    // event.preventDefault() // 这个会阻止最原始的点击事件如 InputControl 里的 Checkbox 选择
    // event.stopPropagation() // 当初使用这个时为了避免继续触发 storypoint 页面的点击事件, 但现在看来它不仅阻止了 StoryPoint 的事件, 也阻止了很多其他事件
    // 所以还得换其他方式: 还是得从区分点击了具体什么组件来考虑
    // 来自 StoryWidget 上的事件加上标记, 后续 StoryPoint 组件可判断点击的目标
    event.__fromStoryWidget__ = true
    this.selectWidget(widget, widgetComponent.disableFab)
  }

  selectWidget(widget: StoryWidget, disableFab: boolean) {
    if (this.editable || !disableFab) {
      this.currentWidget = widget
      this.storyPointService.setCurrentWidgetId(this.currentWidget.key)
    }

    if (this.focus !== widget.key) {
      this.unFocus()
    }
  }

  @HostListener('click', ['$event'])
  onClick(event) {
    if (event.__fromStoryWidget__) {
      return
    }

    this.currentWidget = null
    this.storyPointService.setCurrentWidgetId(null)
    this.openPageDesigner()
    this.unFocus()
  }

  @HostBinding('class.grid-layout__fixed')
  get isLayoutFixed() {
    return this.gridOptions?.gridType === 'fixed' || this.gridOptions?.gridType === 'verticalFixed'
  }

  @HostBinding('class.grid-layout__fit')
  get isLayoutFit() {
    return this.gridOptions?.gridType === 'fit'
  }

  @HostBinding('class.ngm-fullscreen')
  get isFullscreen() {
    return this.storyPointService.storyPoint?.fullscreen
  }

  cloneDeep(item) {
    return { ...item }
  }

  onFilterBarOptionsChange(event) {
    this.storyPointService.setFilterBarOptions(event)
  }

  createWidget(type: string) {
    this.storyService.createStoryWidget({
      component: type
    })
  }

  readonly openPageDesigner = this.storyPointService.effect((origin$: Observable<void>) => {
    return origin$.pipe(
      filter(() => !!this.storyPoint()),
      switchMap(() => {
        const storyPoint = this.storyPoint()
        this.currentWidget = null
        if (storyPoint.type === StoryPointType.Responsive) {
          this.openResponsiveDesigner(storyPoint.responsive?.key)
          return EMPTY
        } else {
          return (
            this.settingsService
              ?.openTabsDesigner<Partial<StoryPoint> | StoryPoint['styling']>(
                `${storyPoint.storyId}/${storyPoint.key}`,
                [
                  {
                    componentType: ComponentSettingsType.StoryPoint,
                    label: 'STORY_DESIGNER.BUILDER_TITLE',
                    icon: 'handyman',
                    model: this.storyPointService.storyPoint$.pipe(
                      map((value) => cloneDeep(pick(value, ['gridOptions'])))
                    )
                  },
                  {
                    componentType: ComponentSettingsType.StoryPoint + 'Style',
                    label: 'STORY_DESIGNER.STYLING_TITLE',
                    icon: 'format_paint',
                    model: this.storyPointService.styling$.pipe(map((value) => cloneDeep(value) ?? {}))
                  }
                ]
              )
              .pipe(
                tap(([builder, styling]) => {
                  builder = { ...(builder ?? {}) }
                  if (styling) {
                    builder.styling = styling
                  }
                  this.storyPointService.updatePoint(builder)
                })
              ) ?? EMPTY
          )
        }
      })
    )
  })

  readonly openResponsiveDesigner = this.storyPointService.effect((origin$: Observable<string>) => {
    return origin$.pipe(
      withLatestFrom(this.storyPoint$),
      switchMap(([key, storyPoint]) => {
        const flexLayout = this.storyPointService.findFlexLayout(key)
        const model = cloneDeep(omit(flexLayout, 'children')) || ({} as FlexLayout)

        if (flexLayout.type === FlexItemType.FlexLayout) {
          return (
            this.settingsService
              ?.openDesigner<FlexLayout>(
                ComponentSettingsType.FlexLayout,
                model,
                `${storyPoint.storyId}/${key || storyPoint.key}`
              )
              .pipe(
                tap((result: FlexLayout) => {
                  this.storyPointService.updateFlexLayout(result)
                })
              ) ?? EMPTY
          )
        } else if (flexLayout.type === FlexItemType.Widget) {
          const widgetKey = flexLayout.widgetKey
          const widget = this.storyPointService.findWidget(widgetKey)
          return (
            this.settingsService
              ?.openTabsDesigner<StoryWidget | FlexLayout>(`${storyPoint.storyId}/${key || storyPoint.key}`, [
                {
                  label: 'STORY_DESIGNER.BUILDER_TITLE',
                  componentType: widget.component,
                  model: widget
                },
                {
                  label: 'STORY_DESIGNER.STYLING_TITLE',
                  componentType: ComponentSettingsType.FlexLayout,
                  model
                }
              ])
              .pipe(
                tap(([widget, flexLayout]) => {
                  if (flexLayout) {
                    this.storyPointService.updateFlexLayout(flexLayout)
                  }
                  if (widget) {
                    this.storyPointService.updateWidget({ ...widget, key: widgetKey })
                  }
                })
              ) ?? EMPTY
          )
        }

        return EMPTY
      })
    )
  })

  openEditAttributes() {
    if (this.editable) {
      this.openPageDesigner()
      this.settingsService?.setEditable(true)
    }
  }

  unFocus() {
    this.focus = null
    const queryParams: Params = { widgetKey: null }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    })
  }

  onFocus(widgetKey: string) {
    this.focus = widgetKey
    const queryParams: Params = { widgetKey }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    })
  }

  async rename() {
    const confirm = await firstValueFrom(
      this._dialog.open(ConfirmUniqueComponent, { data: this.point.name }).afterClosed()
    )

    if (confirm) {
      this.storyPointService.updatePoint({
        name: confirm
      })
    }
  }

  duplicate() {
    this.storyService.duplicateStoryPoint(this.key)
  }

  remove() {
    this.storyService.removeStoryPoint(this.key)
  }

  hidePage() {
    this.storyService.hideStoryPage(this.key)
  }

  showPage() {
    this.storyService.toggleStoryPointHidden(this.key)
  }

  move(direction: MoveDirection) {
    this.storyService.move({
      direction,
      key: this.key
    })
  }

  closeQuickStart() {
    this.closedQuickStart$.next(true)
  }

  async pasteWidget() {
    this.storyService.pasteWidget({ })
  }

  async onUploadChange(event) {
    for await(const file of event.target.files) {
      const widget = await uploadYamlFile<StoryWidget>(file)
      this.storyPointService.createWidget({
        ...widget
      })
    }
  }

  async openShare() {
    const story = await firstValueFrom(this.storyService.story$)
    const isAuthenticated = await firstValueFrom(this.storyService.isAuthenticated$)
    await firstValueFrom(this._dialog
      .open(StorySharesComponent, {
        viewContainerRef: this._viewContainerRef,
        data: {
          access: story.access,
          visibility: story.visibility,
          isAuthenticated,
          id: story.id,
          point: this.point
        }
      })
      .afterClosed()
    )
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKeydown(event: KeyboardEvent) {
    if (this.focus) {
      this.unFocus()
    }
  }

  async onGridContextmenu(event: MouseEvent | PointerEvent) {
    const copySelectedWidget = await firstValueFrom(this.storyService.copySelectedWidget$)
    if (copySelectedWidget) {
      event.stopPropagation()
      event.preventDefault()
  
      const position = {
        x: 0,
        y: 0
      }
      position.x = this.gridster.pixelsToPositionX(event.offsetX, Math.round)
      position.y = this.gridster.pixelsToPositionY(event.offsetY, Math.round)
  
      this.storyPointService.pasteWidget({
        ...copySelectedWidget,
        position: {
          ...copySelectedWidget.position,
          ...position,
        }
      })

      this.storyService.clearCopy()
    }
  }

}

function setDefaultTemplate(flexLayout: FlexLayout, template, widgets) {
  flexLayout.children?.forEach((item) => {
    if (item.type === FlexItemType.Widget) {
      item.template = template
      item.templateContext = widgets.find((widget) => widget.key === item.widgetKey)
    } else {
      setDefaultTemplate(item, template, widgets)
    }
  })
}
