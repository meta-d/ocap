import { DragDropModule } from '@angular/cdk/drag-drop'
import { CdkListboxModule } from '@angular/cdk/listbox'
import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  model,
  signal,
  viewChild
} from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { IPoint, IRect, PointExtensions } from '@foblex/2d'
import {
  EFConnectionType,
  EFResizeHandleType,
  FCanvasChangeEvent,
  FCanvasComponent,
  FCreateConnectionEvent,
  FFlowComponent,
  FFlowModule,
  FReassignConnectionEvent,
  FSelectionChangeEvent,
  FZoomDirective
} from '@foblex/flow'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { DisplayBehaviour } from '@metad/ocap-core'
import { IntersectionObserverModule } from '@ng-web-apis/intersection-observer'
import { toSignal } from '@angular/core/rxjs-interop'
import { TranslateModule } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import {NgxFloatUiModule, NgxFloatUiPlacements, NgxFloatUiTriggers} from 'ngx-float-ui'
import { Subscription } from 'rxjs'
import { delay, map, startWith } from 'rxjs/operators'
import { ICopilotModel, IXpert, IXpertAgentExecution, ModelType, ToastrService, TXpertTeamNode, XpertAgentExecutionEnum, XpertService, XpertTypeEnum, XpertWorkspaceService } from '../../../@core'
import { CopilotModelSelectComponent, MaterialModule, ToolsetCardComponent, XpertAgentExecutionComponent, XpertAgentExecutionLogComponent } from '../../../@shared'
import {
  XpertStudioContextMenuComponent,
  XpertStudioNodeKnowledgeComponent,
  XpertStudioNodeAgentComponent,
  XpertStudioNodeToolsetComponent
} from './components'
import { EReloadReason, SelectionService, XpertStudioApiService } from './domain'
import { XpertStudioHeaderComponent } from './header/header.component'
import { XpertStudioPanelComponent } from './panel/panel.component'
import { XpertStudioToolbarComponent } from './toolbar/toolbar.component'
import { XpertExecutionService } from './services/execution.service'
import { EmojiAvatarComponent } from '../../../@shared/avatar'


@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DragDropModule,
    CdkListboxModule,
    CdkMenuModule,
    RouterModule,
    TranslateModule,
    IntersectionObserverModule,
    MaterialModule,
    FFlowModule,
    NgxFloatUiModule,

    NgmCommonModule,
    EmojiAvatarComponent,
    
    ToolsetCardComponent,
    XpertStudioToolbarComponent,
    XpertStudioContextMenuComponent,
    XpertStudioNodeAgentComponent,
    XpertStudioNodeKnowledgeComponent,
    XpertStudioNodeToolsetComponent,
    XpertStudioHeaderComponent,
    XpertStudioPanelComponent,
    XpertAgentExecutionComponent,
    XpertAgentExecutionLogComponent
  ],
  selector: 'pac-xpert-studio',
  templateUrl: './studio.component.html',
  styleUrl: 'studio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [XpertStudioApiService, SelectionService, XpertExecutionService]
})
export class XpertStudioComponent {
  eXpertAgentExecutionEnum = XpertAgentExecutionEnum
  eNgxFloatUiTriggers = NgxFloatUiTriggers
  eNgxFloatUiPlacements = NgxFloatUiPlacements
  DisplayBehaviour = DisplayBehaviour
  EFConnectionType = EFConnectionType
  eModelType = ModelType
  eXpertTypeEnum = XpertTypeEnum
  public eResizeHandleType = EFResizeHandleType
 
  readonly router = inject(Router)
  readonly route = inject(ActivatedRoute)
  readonly logger = inject(NGXLogger)
  readonly #dialog = inject(MatDialog)
  readonly #toastr = inject(ToastrService)
  readonly workspaceService = inject(XpertWorkspaceService)
  readonly xpertRoleService = inject(XpertService)
  readonly apiService = inject(XpertStudioApiService)
  readonly selectionService = inject(SelectionService)
  readonly executionService = inject(XpertExecutionService)
  readonly #cdr = inject(ChangeDetectorRef)

  readonly fFlowComponent = viewChild(FFlowComponent)
  readonly fCanvasComponent = viewChild(FCanvasComponent)
  readonly fZoom = viewChild(FZoomDirective)

  public contextMenuPosition: IPoint = PointExtensions.initialize(0, 0)

  private subscriptions$ = new Subscription()

  /**
   * @deprecated use xpert
   */
  readonly team = computed(() => this.apiService.team())
  readonly id = computed(() => this.team()?.id)
  readonly rootAgent = computed(() => this.team()?.agent)
  readonly nodes = computed(() => {
    const viewModelNodes = this.viewModel()?.nodes ?? []
    const nodes = viewModelNodes.filter((_) => _.type !== 'xpert')
    const xpertNodes = viewModelNodes.filter((_) => _.type === 'xpert') as any
    xpertNodes.forEach((node) => {
      if (node.nodes) {
        nodes.push(...node.nodes.map((_) => ({
          ..._,
          parentId: node.key
        } as any)))
      }
    })
    return nodes
  })
  readonly xperts = computed(() => this.viewModel()?.nodes.filter((_) => _.type === 'xpert') as (TXpertTeamNode & {type: 'xpert'})[])
  readonly connections = computed(() => {
    const viewModelConnections = [...(this.viewModel()?.connections ?? [])]
    this.viewModel()?.nodes?.filter((_) => _.type === 'xpert').forEach((node: any) => {
      if (node.connections) {
        viewModelConnections.push(...node.connections)
      }
    })
    return viewModelConnections
  })

  public isSingleSelection: boolean = true

  readonly viewModel = toSignal(this.apiService.store.pipe(map((state) => state.draft)))
  readonly panelVisible = model<boolean>(false)
  readonly xpert = computed(() => this.viewModel()?.team)
  readonly position = signal<IPoint>(null)
  readonly scale = signal<number>(null)

  readonly selectedNodeKey = this.selectionService.selectedNodeKey

  // Agent Execution Running status
  readonly agentExecutions = this.executionService.agentExecutions
  readonly preview = model(false)

  constructor() {
    effect(() => {
      // console.log(this.paramId())
    })
  }

  public ngOnInit(): void {
    this.subscriptions$.add(this.subscribeOnReloadData())
  }

  private subscribeOnReloadData(): Subscription {
    return this.apiService.reload$.pipe(
      // startWith(null), delay(1000)
    ).subscribe((reason: EReloadReason | null) => {
      if (reason === EReloadReason.INIT) {
        if (this.xpert().options?.position) {
          this.position.set(this.xpert().options.position)
        }
        if (this.xpert().options?.scale) {
          this.scale.set(this.xpert().options.scale)
        }
      }
      if (reason === EReloadReason.CONNECTION_CHANGED) {
        this.fFlowComponent().clearSelection()
      }
      this.#cdr.detectChanges()
    })
  }

  public onLoaded(): void {
    this.fCanvasComponent().resetScaleAndCenter(false)
  }

  public onContextMenu(event: MouseEvent): void {
    this.contextMenuPosition = this.fFlowComponent().getPositionInFlow(
      PointExtensions.initialize(event.clientX, event.clientY)
    )
  }

  public addConnection(event: FCreateConnectionEvent): void {
    if (!event.fInputId) {
      return
    }

    this.apiService.createConnection(event.fOutputId, event.fInputId)
  }

  public reassignConnection(event: FReassignConnectionEvent): void {
    this.apiService.createConnection(event.fOutputId, event.newFInputId, event.oldFInputId)
  }

  public moveNode(point: IPoint, key: string): void {
    this.apiService.moveNode(key, point)
  }

  public moveXpertGroup(point: IPoint, key: string): void {
    this.apiService.moveNode(key, point)
  }
  public resizeXpertGroup(point: IRect, key: string): void {
    this.apiService.resizeNode(key, point)
  }
  public expandXpertTeam(xpert: TXpertTeamNode) {
    this.apiService.expandXpertNode(xpert.key)
  }
  public removeNode(key: string) {
    this.apiService.removeNode(key)
  }

  public selectionChanged(event: FSelectionChangeEvent): void {
    console.log(event)
    this.isSingleSelection = event.connections.length + event.nodes.length === 1
    this.selectionService.setNodes(event.nodes)
    this.#cdr.markForCheck()
  }

  public onSizeChange(event: IRect, node: TXpertTeamNode) {
    this.apiService.updateNode(node.key, {position: event})
  }

  private mousePosition = {
    x: 0,
    y: 0
  }
  public onMouseDown($event: MouseEvent) {
    this.mousePosition.x = $event.screenX;
    this.mousePosition.y = $event.screenY;
  }
  public onSelectNode($event: MouseEvent, node: TXpertTeamNode) {
    this.selectionService.selectNode(node.key)

    if (
      this.mousePosition.x === $event.screenX &&
      this.mousePosition.y === $event.screenY
    ) {
      // Execute Click
      console.log(`Select node:`, node)
      this.panelVisible.set(true)
    }
  }

  onCanvasChange(event: FCanvasChangeEvent) {
    this.apiService.updateXpertOptions({position: event.position, scale: event.scale})
  }
}
