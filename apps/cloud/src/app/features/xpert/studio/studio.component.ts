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
import { TranslateModule } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { injectParams } from 'ngxtension/inject-params'
import { Subscription } from 'rxjs'
import { delay, map, startWith } from 'rxjs/operators'
import { IXpert, ToastrService, TXpertTeamNode, XpertRoleService, XpertWorkspaceService } from '../../../@core'
import { MaterialModule, ToolsetCardComponent } from '../../../@shared'
import { AppService } from '../../../app.service'
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
import { toSignal } from '@angular/core/rxjs-interop'


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

    NgmCommonModule,
    ToolsetCardComponent,
    XpertStudioToolbarComponent,
    XpertStudioContextMenuComponent,
    XpertStudioNodeAgentComponent,
    XpertStudioNodeKnowledgeComponent,
    XpertStudioNodeToolsetComponent,
    XpertStudioHeaderComponent,
    XpertStudioPanelComponent
  ],
  selector: 'pac-xpert-studio',
  templateUrl: './studio.component.html',
  styleUrl: 'studio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [XpertStudioApiService, SelectionService]
})
export class XpertStudioComponent {
  DisplayBehaviour = DisplayBehaviour
  EFConnectionType = EFConnectionType
  public eResizeHandleType = EFResizeHandleType

  readonly appService = inject(AppService)
  readonly router = inject(Router)
  readonly route = inject(ActivatedRoute)
  readonly logger = inject(NGXLogger)
  readonly #dialog = inject(MatDialog)
  readonly #toastr = inject(ToastrService)
  readonly workspaceService = inject(XpertWorkspaceService)
  readonly xpertRoleService = inject(XpertRoleService)
  readonly paramId = injectParams('id')
  readonly apiService = inject(XpertStudioApiService)
  readonly selectionService = inject(SelectionService)
  readonly #cdr = inject(ChangeDetectorRef)

  readonly fFlowComponent = viewChild(FFlowComponent)
  readonly fCanvasComponent = viewChild(FCanvasComponent)
  readonly fZoom = viewChild(FZoomDirective)

  readonly isMobile = this.appService.isMobile

  public contextMenuPosition: IPoint = PointExtensions.initialize(0, 0)

  private subscriptions$ = new Subscription()

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

  constructor() {
    effect(
      () => {
        //   if (this.xpertRole()) {
        //     this.apiService.initRole(this.xpertRole())
        //   }
        //   // console.log(this.paramId(), this.xpertRole())
        console.log(this.viewModel())
      },
      { allowSignalWrites: true }
    )
  }

  public ngOnInit(): void {
    this.subscriptions$.add(this.subscribeOnReloadData())
  }

  private subscribeOnReloadData(): Subscription {
    return this.apiService.reload$.pipe(startWith(null), delay(1000)).subscribe((reason: EReloadReason | null) => {
      // this.getData()
      if (reason === EReloadReason.CONNECTION_CHANGED) {
        this.fFlowComponent().clearSelection()
      }
      // this.#cdr.detectChanges()
    })
  }

  private getData(): void {
    // this.viewModel.set(this.apiService.get())
    // this.form = new BuildFormHandler().handle(new BuildFormRequest(this.viewModel));
    console.log(this.viewModel())
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
    console.log(`Add connecton:`, event)
    if (!event.fInputId) {
      return
    }

    this.apiService.createConnection(event.fOutputId, event.fInputId)
  }

  public reassignConnection(event: FReassignConnectionEvent): void {
    console.log(`Reassign connecton:`, event)
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

  public selectionChanged(event: FSelectionChangeEvent): void {
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
    if (
      this.mousePosition.x === $event.screenX &&
      this.mousePosition.y === $event.screenY
    ) {
      // Execute Click
      console.log(`Select node:`, node)
      this.panelVisible.set(true)
    }
  }
}
