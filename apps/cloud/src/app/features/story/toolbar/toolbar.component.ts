import { animate, style, transition, trigger } from '@angular/animations'
import { CdkDragEnd } from '@angular/cdk/drag-drop'
import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewContainerRef,
  computed,
  inject
} from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { CopilotChatMessage } from '@metad/copilot'
import { NgmInputComponent } from '@metad/ocap-angular/common'
import { AppearanceDirective, DensityDirective } from '@metad/ocap-angular/core'
import { cloneDeep, omit } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { StoriesService, convertNewSemanticModelResult } from '@metad/cloud/state'
import { ConfirmUniqueComponent } from '@metad/components/confirm'
import { ConfirmCodeEditorComponent } from '@metad/components/editor'
import { DeepPartial, IsNilPipe } from '@metad/core'
import {
  ParametersComponent,
  PreferencesComponent,
  QuerySettingComponent,
  ThemeBuilderComponent
} from '@metad/story'
import {
  EmulatedDevice,
  NxStoryService,
  STORY_WIDGET_COMPONENT,
  StoryPoint,
  StoryPointType,
  StoryWidget,
  StoryWidgetComponentProvider,
  WidgetComponentType
} from '@metad/story/core'
import { StorySharesComponent } from '@metad/story/story'
import { combineLatest, firstValueFrom } from 'rxjs'
import { map } from 'rxjs/operators'
import { ToastrService, tryHttp } from '../../../@core'
import { MaterialModule, ProjectFilesComponent } from '../../../@shared'
import { StoryDesignerComponent } from '../designer'
import { SaveAsTemplateComponent } from '../save-as-template/save-as-template.component'
import { StoryDetailsComponent } from '../story-details/story-details.component'
import { DeviceOrientation, DeviceZooms, EmulatedDevices, StoryScales, downloadStory } from '../types'
import { StoryToolbarService } from './toolbar.service'
import { COMPONENTS, PAGES } from './types'
import { CHARTS } from '@metad/story/widgets/analytical-card'


@Component({
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    CdkMenuModule,
    TranslateModule,
    FormsModule,
    IsNilPipe,
    AppearanceDirective,
    DensityDirective,
    StoryDesignerComponent,
    NgmInputComponent
  ],
  selector: 'pac-story-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['toolbar.component.scss'],
  animations: [
    trigger('inOut', [
      transition('void => *', [
        style({ opacity: 0, width: 0 }), // initial styles
        animate(
          '300ms',
          style({ opacity: 1, width: '320px' }) // final style after the transition has finished
        )
      ]),
      transition('* => void', [
        animate(
          '300ms',
          style({ opacity: 0, width: 0 }) // we asume the initial style will be always opacity: 1
        )
      ])
    ])
  ]
})
export class StoryToolbarComponent implements OnInit {
  @HostBinding('class.pac-story-toolbar') isStoryToolbar = true
  ComponentType = WidgetComponentType
  STORY_POINT_TYPE = StoryPointType
  EmulatedDevices = [
    {
      name: 'Unset',
      value: null
    },
    ...EmulatedDevices.map((item) => ({
      name: item.name,
      value: item
    })),
    {
      name: 'Custom',
      value: {
        name: 'Custom',
        width: null,
        height: null
      }
    }
  ]
  StoryScales = StoryScales
  DeviceZooms = DeviceZooms
  DeviceOrientation = DeviceOrientation

  public readonly storyService = inject(NxStoryService)
  public readonly toastrService = inject(ToastrService)
  private readonly storiesService = inject(StoriesService)
  private readonly _elRef = inject(ElementRef)
  public toolbarService = inject(StoryToolbarService)
  private _dialog = inject(MatDialog)
  private _viewContainerRef = inject(ViewContainerRef)
  private _widgetComponents?: Array<StoryWidgetComponentProvider> = inject(STORY_WIDGET_COMPONENT, { optional: true })

  @Input() editable: boolean

  @Output() editableChange = new EventEmitter()
  @Output() fieldControlDrawer = new EventEmitter()
  @Output() settingToggle = new EventEmitter()
  @Output() fullscreen = new EventEmitter()
  @Output() emulatedDeviceChange = new EventEmitter<EmulatedDevice>()
  @Output() deviceZoomChange = new EventEmitter()
  @Output() resetScalePan = new EventEmitter()

  showDetails: null | 'newPages' | 'storyDesigner' | 'widgets' | 'devices' | 'preferences'
  _fullscreen: boolean
  @HostBinding('class.pac-toolbar__on-right')
  onRight = false
  @HostBinding('class.pac-toolbar__expand-less')
  expandLess = true

  charts = CHARTS.map((item) => cloneDeep(item) as any)
  widgets = [...COMPONENTS]
  pages = [...PAGES]

  thirdPartyWidgetComponents = []
  emulatedDeviceName: string
  _emulatedDevice: EmulatedDevice = null
  emulatedDevice: EmulatedDevice = null
  deviceZoom = null
  orientation = DeviceOrientation.portrait
  deviceFold = false
  exporting = false
  conversations: CopilotChatMessage[] = []

  readonly isDirty$ = this.storyService.dirty$
  readonly isNotDirty$ = this.isDirty$.pipe(map((dirty) => !dirty))
  readonly saving$ = this.storyService.saving$
  readonly disableSave$ = combineLatest([this.isDirty$, this.saving$]).pipe(
    map(([isDirty, saving]) => !isDirty || saving)
  )
  public readonly pointList$ = this.storyService.points$

  public readonly isMobile$ = this.storyService.isMobile$

  public readonly storyOptions = toSignal(this.storyService.storyOptions$)
  public readonly scale = computed(() => this.storyOptions()?.scale ?? 100)

  public readonly creatingWidget$ = this.toolbarService.creatingWidget$
  public readonly isPanMode$ = this.storyService.isPanMode$

  public readonly isWidgetSelected = computed(() => !this.storyService.currentWidget())
  /**
  |--------------------------------------------------------------------------
  | Signals
  |--------------------------------------------------------------------------
  */
  readonly isCopyWidgetSelected$ = toSignal(this.storyService.copySelectedWidget$)
  
  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effect)
  |--------------------------------------------------------------------------
  */
  private _devicesSub = this.storyService.storyOptions$
    .pipe(map((options) => options?.emulatedDevice), takeUntilDestroyed())
    .subscribe((emulatedDevice) => {
      this.emulatedDeviceName = emulatedDevice?.name
      this.emulatedDevice = EmulatedDevices.find((item) => item.name === this.emulatedDeviceName) ?? {
        ...emulatedDevice
      }
    })

  ngOnInit(): void {
    this.widgets.push(
      ...this._widgetComponents
        .filter((component) => !(component.type in WidgetComponentType))
        .map((item) => ({
          code: item.label,
          label: item.label,
          icon: item.icon,
          value: {
            component: item.type
          }
        }))
    )
  }

  toggleExpand() {
    if (this.expandLess) {
      this.showDetails = null
    }
    this.expandLess = !this.expandLess
  }

  createWidget(widget: DeepPartial<StoryWidget>) {
    this.toolbarService.createWidget(widget)
  }

  toggleEditable(editable: boolean) {
    this.editableChange.emit(editable)
  }

  setScale(scale: number) {
    this.storyService.updateStoryOptions({
      scale
    })
  }

  toggleMobile(device: EmulatedDevice) {
    if (this.emulatedDevice?.name === device?.name) {
      this._emulatedDevice = this.emulatedDevice
      this.emulatedDevice = null
    } else {
      this.emulatedDevice = device
    }
    this.emitMobile()
  }

  emitMobile() {
    let emulatedDevice = this.emulatedDevice ? { ...this.emulatedDevice } : null

    if (emulatedDevice) {
      if (this.deviceFold) {
        emulatedDevice = {
          ...emulatedDevice,
          ...(emulatedDevice.fold ?? {})
        }
      }
      if (this.orientation === DeviceOrientation.landscape) {
        emulatedDevice = {
          ...emulatedDevice,
          width: emulatedDevice.height,
          height: emulatedDevice.width
        }
      }
    }

    this.emulatedDeviceChange.emit(emulatedDevice)
  }

  setEmulatedDevice(device) {
    this.emulatedDevice = { ...device }
    this.emitMobile()
  }

  setDeviceZoom(zoom) {
    this.deviceZoom = zoom
    this.deviceZoomChange.emit(zoom)
  }

  toggleOrientation(orientation) {
    this.orientation =
      orientation ??
      (this.orientation === DeviceOrientation.portrait ? DeviceOrientation.landscape : DeviceOrientation.portrait)
    this.emitMobile()
  }

  toggleDeviceFold() {
    this.deviceFold = !this.deviceFold
    this.emitMobile()
  }

  onEmulatedDeviceChange() {
    this.emulatedDevice = { ...this.emulatedDevice, name: 'Custom' }
    this.emitMobile()
  }

  dragStartHandler(ev: DragEvent, widget: DeepPartial<StoryWidget>) {
    if (ev.dataTransfer) {
      ev.dataTransfer.setData(
        'json',
        JSON.stringify({
          ...widget,
          position: widget.position ?? {
            width: 200,
            height: 180
          }
        })
      )
      ev.dataTransfer.dropEffect = 'copy'
    }
  }

  async openStoryDetails() {
    const story = await firstValueFrom(this.storyService.story$)
    const result = await firstValueFrom(
      this._dialog
        .open(StoryDetailsComponent, {
          data: {
            name: story.name,
            description: story.description,
            previewId: story.previewId,
            preview: story.preview,
            thumbnail: story.thumbnail,
            projectId: story.projectId,
            modelId: story.modelId,
            models: story.models,
            options: cloneDeep(story.options)
          }
        })
        .afterClosed()
    )

    if (result) {
      this.storyService.updateStory(omit(result, 'options', 'models'))
      this.storyService.updateStoryOptions(result.options)

      if (
        !(
          result.models.length === story.models.length &&
          result.models.every((item) => story.models.some((m) => m.id === item.id))
        )
      ) {
        const newStory = await tryHttp(
          this.storiesService.updateModels(
            story.id,
            result.models.map((item) => item.id)
          ),
          this.toastrService
        )
        this.storyService.updateStory({
          models: newStory.models.map((item) => convertNewSemanticModelResult(item))
        })
      }
    }
  }

  /**
   * 打开首选项窗口
   */
  async openPreferences() {
    const result = await firstValueFrom(
      this._dialog
        .open(PreferencesComponent, {
          panelClass: 'large',
          data: {
            preferences: await firstValueFrom(
              this.storyService.story$.pipe(map((story) => story?.options?.preferences))
            ),
            echartsTheme: await firstValueFrom(this.storyService.echartsTheme$)
          }
        })
        .afterClosed()
    )

    if (result) {
      this.storyService.updateStoryOptions(result)
    }
  }

  async openAdvancedStyle() {
    const story = await firstValueFrom(this.storyService.story$)

    const advancedStyle = await firstValueFrom(
      this._dialog
        .open(ConfirmCodeEditorComponent, {
          panelClass: 'medium',
          data: {
            language: 'css',
            model: story?.options?.advancedStyle
          }
        })
        .afterClosed()
    )

    if (advancedStyle) {
      this.storyService.updateStoryOptions({ advancedStyle })
    }
  }

  async openCalculations() {
    // const dataSource = await firstValueFrom(this.storyService.dataSource$)
    const result = await firstValueFrom(
      this._dialog
        .open(ParametersComponent, {
          viewContainerRef: this._viewContainerRef,
          panelClass: 'medium',
          data: {
            // dataSource
          }
        })
        .afterClosed()
    )
  }

  async saveAsTemplate() {
    const story = await firstValueFrom(this.storyService.story$)
    const points = await firstValueFrom(this.storyService.pageStates$)
    const asTemplate = await firstValueFrom(
      this._dialog
        .open(SaveAsTemplateComponent, {
          panelClass: 'medium',
          data: {
            story,
            points
          }
        })
        .afterClosed()
    )
  }

  openSubscription() {
    // this._dialog
    //   .open(SubscriptionComponent, {
    //     panelClass: 'medium',
    //     data: {}
    //   })
    //   .afterClosed()
    //   .subscribe((result) => {
    //     if (result) {
    //       //
    //     }
    //   })
  }

  async openQuerySettings() {
    const result = await firstValueFrom(
      this._dialog
        .open(QuerySettingComponent, {
          panelClass: 'medium',
          data: {}
        })
        .afterClosed()
    )
  }

  async openThemeBuilder() {
    const result = await firstValueFrom(
      this._dialog
        .open(ThemeBuilderComponent, {
          panelClass: 'medium',
          data: await firstValueFrom(this.storyService.echartsTheme$)
        })
        .afterClosed()
    )
    if (result) {
      this.storyService.updateStoryOptions({
        echartsTheme: result
      })
    }
  }

  async openMaterials() {
    const story = await firstValueFrom(this.storyService.story$)
    const result = await firstValueFrom(
      this._dialog
        .open(ProjectFilesComponent, {
          panelClass: 'medium',
          data: {
            projectId: story.projectId
          }
        })
        .afterClosed()
    )
    if (result) {
    }
  }

  /**
   * 把当前选中的widget复制到选中的point中
   */
  async onCopyTo(pointKey: string) {
    const name = await firstValueFrom(this._dialog.open(ConfirmUniqueComponent).afterClosed())
    if (name) {
      this.storyService.copyTo({ name, pointKey })
    }
  }

  async onCopyToNew(type: StoryPointType) {
    await this.storyService.copyToNew(type)
  }

  async pasteWidget() {
    const name = await firstValueFrom(this._dialog.open(ConfirmUniqueComponent).afterClosed())

    if (name) {
      this.storyService.pasteWidget({ name })
    }
  }

  async openShare() {
    const story = await firstValueFrom(this.storyService.story$)
    const isAuthenticated = await firstValueFrom(this.storyService.isAuthenticated$)
    const result = await firstValueFrom(
      this._dialog
        .open(StorySharesComponent, {
          viewContainerRef: this._viewContainerRef,
          data: {
            id: story.id,
            visibility: story.visibility,
            isAuthenticated,
            access: story.access,
            models: story.models
          }
        })
        .afterClosed()
    )
  }

  async createStoryPage(input: Partial<StoryPoint>) {
    const name = await firstValueFrom(this._dialog.open(ConfirmUniqueComponent).afterClosed())
    if (name) {
      this.storyService.newStoryPage({
        ...input,
        name,
        type: StoryPointType.Canvas
      })
      this.showDetails = null
    }
  }

  copyWidget() {
    this.storyService.copyWidget(null)
  }

  /**
   * 复制当前选中的widget,并粘贴到当前page内
   */
  duplicateWidget() {
    this.storyService.duplicateWidget()
  }

  async export() {
    this.exporting = true
    await downloadStory(this.storiesService, this.storyService.story.id)
    this.exporting = false
  }

  toggleFullscreen(status?: boolean) {
    this._fullscreen = status ?? !this._fullscreen
    this.fullscreen.emit(this._fullscreen)
  }

  async togglePanTool() {
    const isPanMode = await firstValueFrom(this.isPanMode$)
    this.storyService.patchState({ isPanMode: !isPanMode })
  }

  async zoomIn() {
    this.storyService.updateStoryOptions({
      scale: this.scale() + 10
    })
  }

  async zoomOut() {
    this.storyService.updateStoryOptions({
      scale: this.scale() - 10
    })
  }

  calculateRightSide(event: CdkDragEnd) {
    const element: HTMLElement = this._elRef.nativeElement
    const parent = element.parentElement
    const elementRect = element.getBoundingClientRect()
    const parentRect = parent.getBoundingClientRect()

    if (elementRect.left < parentRect.left) {
      event.source.reset()
      if (this.onRight) {
        element.style.right = 'auto'
        element.style.left = '14px'
      }
    }

    const windowWidth = window.innerWidth
    const widthBetweenDivAndRight = windowWidth - element.getBoundingClientRect().right
    this.onRight = widthBetweenDivAndRight < 368

    if (elementRect.left + elementRect.width > parentRect.right) {
      event.source.reset()
      element.style.right = '14px'
    }

    if (elementRect.top < parentRect.top) {
      event.source.setFreeDragPosition({ x: event.source.getFreeDragPosition().x, y: 0 })
    }

    if (elementRect.top > parentRect.bottom - 100) {
      event.source.setFreeDragPosition({ x: event.source.getFreeDragPosition().x, y: parentRect.bottom - 200 })
    }

    if (this.onRight) {
      const point = event.source.getFreeDragPosition()
      event.source.setFreeDragPosition({ x: 0, y: point.y })
      element.style.right = '14px'
      element.style.left = 'auto'
    } else if (element.getBoundingClientRect().left < 50) {
      const point = event.source.getFreeDragPosition()
      event.source.setFreeDragPosition({ x: 0, y: element.getBoundingClientRect().left < 15 ? 0 : point.y })
      element.style.right = 'auto'
      element.style.left = '14px'
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKeydown(event: KeyboardEvent) {
    this.toggleFullscreen(false)
  }

  @HostListener('document:keydown.alt', ['$event'])
  onSpaceKeydown(event: KeyboardEvent) {
    this.storyService.patchState({ isPanMode: true })
  }

  @HostListener('document:keyup.alt', ['$event'])
  onSpaceKeyUp(event: KeyboardEvent) {
    this.storyService.patchState({ isPanMode: false })
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 's') {
      this.storyService.saveStory()
      event.preventDefault()
      return
    }

    if (event.altKey) {
      switch (event.code) {
        case 'Minus':
          this.storyService.zoomOut()
          break
        case 'Equal':
          this.storyService.zoomIn()
          break
        case 'Escape':
          this.resetScalePan.emit()
          break
      }
    }

    // 在其他地方点 Delete 也会删除 Widget, 除非给 Widget 加上 Focus
    // if (event.key === 'Delete') {
    //   this.storyService.removeCurrentWidget()
    // }
  }
}
