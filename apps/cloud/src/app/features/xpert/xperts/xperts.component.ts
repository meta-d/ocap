import { DragDropModule } from '@angular/cdk/drag-drop'
import { CdkListboxModule } from '@angular/cdk/listbox'
import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, viewChild } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NgmCommonModule, NgmConfirmDeleteComponent, NgmTagsComponent } from '@metad/ocap-angular/common'
import { AppearanceDirective } from '@metad/ocap-angular/core'
import { DisplayBehaviour } from '@metad/ocap-core'
import { IntersectionObserverModule } from '@ng-web-apis/intersection-observer'
import { TranslateModule } from '@ngx-translate/core'
import { isNil, omitBy } from 'lodash-es'
import { NGXLogger } from 'ngx-logger'
import { derivedAsync } from 'ngxtension/derived-async'
import { BehaviorSubject, EMPTY } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import {
  getErrorMessage,
  IXpertRole,
  routeAnimations,
  ToastrService,
  XpertService,
  XpertToolsetCategoryEnum,
  XpertTypeEnum,
  XpertWorkspaceService
} from '../../../@core'
import { AvatarComponent, MaterialModule, UserPipe } from '../../../@shared'
import { AppService } from '../../../app.service'
import { XpertNewBlankComponent } from '../blank/blank.component'
import { XpertHomeComponent } from '../home.component'
import { XpertStudioCreateToolComponent } from '../tools/create/create.component'

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
    UserPipe,
    AppearanceDirective
  ],
  selector: 'pac-xpert-xperts',
  templateUrl: './xperts.component.html',
  styleUrl: 'xperts.component.scss',
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XpertStudioXpertsComponent {
  DisplayBehaviour = DisplayBehaviour
  XpertRoleTypeEnum = XpertTypeEnum

  readonly appService = inject(AppService)
  readonly router = inject(Router)
  readonly route = inject(ActivatedRoute)
  readonly logger = inject(NGXLogger)
  readonly #dialog = inject(MatDialog)
  readonly #toastr = inject(ToastrService)
  readonly workspaceService = inject(XpertWorkspaceService)
  readonly xpertService = inject(XpertService)
  readonly homeComponent = inject(XpertHomeComponent)

  readonly contentContainer = viewChild('contentContainer', { read: ElementRef })

  readonly isMobile = this.appService.isMobile
  readonly lang = this.appService.lang

  readonly workspace = this.homeComponent.workspace
  readonly type = this.homeComponent.type

  readonly refresh$ = new BehaviorSubject<void>(null)
  readonly xperts = derivedAsync(() => {
    const where = {
      type: this.type(),
      latest: true
    }
    const workspace = this.workspace()
    return this.refresh$.pipe(
      switchMap(() =>
        this.xpertService.getAllByWorkspace(workspace, {
          where: omitBy(where, isNil),
          relations: ['createdBy']
        })
      ),
      map(({ items }) => items.filter((item) => item.latest))
    )
  })

  readonly isXperts = computed(() => Object.values(XpertTypeEnum).includes(this.type() as XpertTypeEnum))
  readonly isTools = computed(() => this.type() === XpertToolsetCategoryEnum.API )

  refresh() {
    this.refresh$.next()
  }

  newBlank() {
    this.#dialog
      .open(XpertNewBlankComponent, {
        disableClose: true,
        data: {
          workspace: this.workspace()
        }
      })
      .afterClosed()
      .subscribe((xpert) => {
        if (xpert) {
          this.router.navigate([xpert.id], { relativeTo: this.route })
        }
      })
  }

  deleteXpert(xpert: IXpertRole) {
    this.#dialog
      .open(NgmConfirmDeleteComponent, {
        data: {
          // title: xpert.title,
          value: xpert.name,
          information: `Delete all data of xpert ${xpert.title}?`
        }
      })
      .afterClosed()
      .pipe(switchMap((confirm) => (confirm ? this.xpertService.delete(xpert.id) : EMPTY)))
      .subscribe({
        next: () => {
          this.#toastr.success('PAC.Messages.DeletedSuccessfully', { Default: 'Deleted successfully!' }, xpert.title)
          this.refresh()
        },
        error: (error) => {
          this.#toastr.error(getErrorMessage(error))
        }
      })
  }

  createTool() {
    this.#dialog
    .open(XpertStudioCreateToolComponent, {
      data: {
      }
    })
    .afterClosed()
    .subscribe({
      next: () => {
        this.#toastr.success('PAC.Messages.CreatedSuccessfully', { Default: 'Created Successfully!' })
      },
      error: (error) => {
        this.#toastr.error(getErrorMessage(error))
      }
    })
  }
}
