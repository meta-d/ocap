import { DragDropModule } from '@angular/cdk/drag-drop'
import { CdkListboxModule } from '@angular/cdk/listbox'
import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  model,
  signal,
  viewChild
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import {
  NgmCommonModule,
  NgmConfirmUniqueComponent,
  NgmTagsComponent
} from '@metad/ocap-angular/common'
import { AppearanceDirective } from '@metad/ocap-angular/core'
import { DisplayBehaviour } from '@metad/ocap-core'
import { IntersectionObserverModule } from '@ng-web-apis/intersection-observer'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { BehaviorSubject, EMPTY } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import {
  getErrorMessage,
  ITag,
  routeAnimations,
  ToastrService,
  XpertService,
  XpertToolsetCategoryEnum,
  XpertToolsetService,
  XpertTypeEnum,
  XpertWorkspaceService
} from '../../@core'
import { MaterialModule, TagFilterComponent, UserPipe } from '../../@shared'
import { AppService } from '../../app.service'
import { WorkspaceSettingsComponent } from './workspace-settings/settings.component'

export type XpertFilterEnum = XpertToolsetCategoryEnum | XpertTypeEnum


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

    NgmCommonModule,
    NgmTagsComponent,
    UserPipe,
    AppearanceDirective,
    TagFilterComponent
  ],
  selector: 'pac-xpert-home',
  templateUrl: './home.component.html',
  styleUrl: 'home.component.scss',
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XpertHomeComponent {
  DisplayBehaviour = DisplayBehaviour
  XpertRoleTypeEnum = XpertTypeEnum
  XpertToolsetCategory = XpertToolsetCategoryEnum

  readonly appService = inject(AppService)
  readonly router = inject(Router)
  readonly route = inject(ActivatedRoute)
  readonly logger = inject(NGXLogger)
  readonly #dialog = inject(MatDialog)
  readonly #toastr = inject(ToastrService)
  readonly #translate = inject(TranslateService)
  readonly workspaceService = inject(XpertWorkspaceService)
  readonly xpertService = inject(XpertService)
  readonly toolsetService = inject(XpertToolsetService)

  readonly contentContainer = viewChild('contentContainer', { read: ElementRef })

  readonly isMobile = this.appService.isMobile
  readonly lang = this.appService.lang

  readonly workspaces = toSignal(this.workspaceService.getAllInOrg().pipe(map(({ items }) => items)))
  readonly selectedWorkspaces = model<string[]>([null])
  readonly workspace = computed(() => this.workspaces()?.find((_) => _.id === this.selectedWorkspaces()[0])) // signal<IXpertWorkspace>(null)

  readonly refresh$ = new BehaviorSubject<void>(null)

  readonly types = model<XpertTypeEnum>(null)
  readonly type = computed(() => this.types()?.[0])

  readonly tags = model<ITag[]>([])

  readonly toolTags = toSignal(this.toolsetService.getAllTags().pipe(
    map((toolTags) => toolTags.map((_) => ({
      id: _.name,
      name: _.label
    } as unknown as ITag)))
  ))

  newWorkspace() {
    this.#dialog
      .open(NgmConfirmUniqueComponent, {
        data: {
          title: `Create New Workspace`
        }
      })
      .afterClosed()
      .pipe(switchMap((name) => (name ? this.workspaceService.create({ name }) : EMPTY)))
      .subscribe({
        next: (workspace) => {
          this.#toastr.success(`PAC.Messages.CreatedSuccessfully`, { Default: 'Created Successfully!' })
        },
        error: (error) => {
          this.#toastr.error(getErrorMessage(error))
        }
      })
  }

  refresh() {
    this.refresh$.next()
  }

  openSettings() {
    this.#dialog
      .open(WorkspaceSettingsComponent, {
        data: {
          title: this.#translate.instant('PAC.Xpert.CreateNewWorkspace', {Default: 'Create New Workspace'})
        }
      })
      .afterClosed()
      .subscribe()
  }
}
