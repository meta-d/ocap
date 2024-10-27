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
import { TranslateModule } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { derivedAsync } from 'ngxtension/derived-async'
import { BehaviorSubject, EMPTY } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import {
  getErrorMessage,
  IXpertRole,
  IXpertWorkspace,
  routeAnimations,
  ToastrService,
  XpertService,
  XpertToolsetCategoryEnum,
  XpertTypeEnum,
  XpertWorkspaceService
} from '../../@core'
import { AvatarComponent, MaterialModule, UserPipe } from '../../@shared'
import { AppService } from '../../app.service'
import { WorkspaceSettingsComponent } from './workspace-settings/settings.component'
import { isNil, omitBy } from 'lodash-es'

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
    AvatarComponent,
    NgmTagsComponent,
    UserPipe,
    AppearanceDirective
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
  readonly workspaceService = inject(XpertWorkspaceService)
  readonly xpertService = inject(XpertService)

  readonly contentContainer = viewChild('contentContainer', { read: ElementRef })

  readonly isMobile = this.appService.isMobile
  readonly lang = this.appService.lang

  readonly workspaces = toSignal(this.workspaceService.getAllInOrg().pipe(map(({ items }) => items)))
  readonly workspace = signal<IXpertWorkspace>(null)

  readonly refresh$ = new BehaviorSubject<void>(null)
  // readonly xperts = derivedAsync(() => {
  //   const where = {
  //     type: this.type(),
  //     latest: true
  //   }
  //   const workspace = this.workspace()
  //   return this.refresh$.pipe(
  //     switchMap(() =>
  //       this.xpertService.getAllByWorkspace(workspace, {
  //         where: omitBy(where, isNil),
  //         relations: ['createdBy']
  //       })
  //     ),
  //     map(({ items }) => items.filter((item) => item.latest))
  //   )
  // })

  readonly types = model<XpertTypeEnum>(null)
  readonly type = computed(() => this.types()?.[0])

  switchWorkspace(item: IXpertWorkspace) {
    this.workspace.set(item)
  }

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
          title: `Create New Workspace`
        }
      })
      .afterClosed()
      .subscribe()
  }

}