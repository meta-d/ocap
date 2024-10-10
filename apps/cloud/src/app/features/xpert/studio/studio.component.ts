import { DragDropModule } from '@angular/cdk/drag-drop'
import { CdkListboxModule } from '@angular/cdk/listbox'
import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  signal,
  viewChild
} from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { IPoint, PointExtensions } from '@foblex/2d'
import {
  FCanvasComponent,
  FCreateConnectionEvent,
  FFlowComponent,
  FFlowModule,
  FReassignConnectionEvent,
  FZoomDirective
} from '@foblex/flow'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { DisplayBehaviour } from '@metad/ocap-core'
import { IntersectionObserverModule } from '@ng-web-apis/intersection-observer'
import { TranslateModule } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { injectParams } from 'ngxtension/inject-params'
import { Subscription } from 'rxjs'
import { startWith } from 'rxjs/operators'
import { ToastrService, XpertRoleService, XpertWorkspaceService } from '../../../@core'
import { MaterialModule, ToolsetCardComponent } from '../../../@shared'
import { AppService } from '../../../app.service'
import { XpertStudioContextMenuComponent, XpertStudioRoleComponent } from './components'
import { EReloadReason, IRoleViewModel, IStudioModel, XpertStudioApiService } from './domain'
import { XpertStudioToolbarComponent } from './toolbar/toolbar.component'

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
    XpertStudioRoleComponent
  ],
  selector: 'pac-xpert-studio',
  templateUrl: './studio.component.html',
  styleUrl: 'studio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [XpertStudioApiService]
})
export class XpertStudioComponent {
  DisplayBehaviour = DisplayBehaviour

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
  readonly #cdr = inject(ChangeDetectorRef)

  readonly fFlowComponent = viewChild(FFlowComponent)
  readonly fCanvasComponent = viewChild(FCanvasComponent)
  readonly fZoom = viewChild(FZoomDirective)

  readonly isMobile = this.appService.isMobile

  // readonly xpertRole = derivedFrom([this.paramId], pipe(
  //   switchMap(([id]) => this.xpertRoleService.getOneById(id, { relations: ['members', 'toolsets'] }))), {
  //   initialValue: null
  // })

  public contextMenuPosition: IPoint = PointExtensions.initialize(0, 0)

  private subscriptions$ = new Subscription()
  readonly viewModel = signal<IStudioModel>({
    team: null,
    roles: [],
    connections: []
  })

  readonly team = computed(() => this.viewModel()?.team)
  readonly roles = computed(() => this.viewModel()?.roles)
  readonly connections = computed(() => this.viewModel()?.connections)

  constructor() {
    // effect(() => {
    //   if (this.xpertRole()) {
    //     this.apiService.initRole(this.xpertRole())
    //   }
    //   // console.log(this.paramId(), this.xpertRole())
    // }, { allowSignalWrites: true })
  }

  public ngOnInit(): void {
    this.subscriptions$.add(this.subscribeOnReloadData())
  }

  private subscribeOnReloadData(): Subscription {
    return this.apiService.reload$.pipe(startWith(null)).subscribe((reason: EReloadReason | null) => {
      this.getData()
      if (reason === EReloadReason.CONNECTION_CHANGED) {
        this.fFlowComponent().clearSelection()
      }
      this.#cdr.detectChanges()
    })
  }

  private getData(): void {
    this.viewModel.set(this.apiService.get())
    // this.form = new BuildFormHandler().handle(new BuildFormRequest(this.viewModel));
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
    if (!event.newFInputId) {
      return
    }
  }

  public moveXpertRole(point: IPoint, role: IRoleViewModel): void {
    role.position = point;
    this.apiService.moveXpertRole(role.key, point);
  }
}
