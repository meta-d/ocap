import { DragDropModule } from '@angular/cdk/drag-drop'
import { CdkListboxModule } from '@angular/cdk/listbox'
import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NgmCommonModule, NgmConfirmUniqueComponent, NgmTagsComponent } from '@metad/ocap-angular/common'
import { DisplayBehaviour } from '@metad/ocap-core'
import { IntersectionObserverModule } from '@ng-web-apis/intersection-observer'
import { TranslateModule } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { EMPTY } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { getErrorMessage, IXpertWorkspace, routeAnimations, ToastrService, XpertRoleService, XpertWorkspaceService } from '../../@core'
import { AvatarComponent, MaterialModule } from '../../@shared'
import { AppService } from '../../app.service'
import { derivedAsync } from 'ngxtension/derived-async'
import { WorkspaceSettingsComponent } from './workspace-settings/settings.component'

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
    NgmTagsComponent
  ],
  selector: 'pac-xpert-home',
  templateUrl: './home.component.html',
  styleUrl: 'home.component.scss',
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XpertHomeComponent {
  DisplayBehaviour = DisplayBehaviour

  readonly appService = inject(AppService)
  readonly router = inject(Router)
  readonly route = inject(ActivatedRoute)
  readonly logger = inject(NGXLogger)
  readonly #dialog = inject(MatDialog)
  readonly #toastr = inject(ToastrService)
  readonly workspaceService = inject(XpertWorkspaceService)
  readonly xpertService = inject(XpertRoleService)

  readonly contentContainer = viewChild('contentContainer', { read: ElementRef })

  readonly isMobile = this.appService.isMobile
  readonly lang = this.appService.lang

  readonly workspaces = toSignal(this.workspaceService.getAllInOrg().pipe(map(({ items }) => items)))
  readonly workspace = signal<IXpertWorkspace>(null)

  readonly xpertRoles = derivedAsync(() => {
    return this.xpertService.getAllByWorkspace(this.workspace()).pipe(
      map(({items}) => items.filter((item) => item.latest))
    )
  })

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
