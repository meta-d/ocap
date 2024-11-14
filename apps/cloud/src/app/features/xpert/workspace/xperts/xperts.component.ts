import { DragDropModule } from '@angular/cdk/drag-drop'
import { CdkListboxModule } from '@angular/cdk/listbox'
import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, viewChild } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NgmCommonModule, NgmConfirmDeleteComponent } from '@metad/ocap-angular/common'
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
  IToolProvider,
  IXpertRole,
  IXpertToolset,
  OrderTypeEnum,
  routeAnimations,
  ToastrService,
  XpertService,
  XpertToolsetCategoryEnum,
  XpertToolsetService,
  XpertTypeEnum,
  XpertWorkspaceService
} from '../../../../@core'
import { CardCreateComponent, MaterialModule, ToolProviderCardComponent, ToolsetCardComponent, UserPipe } from '../../../../@shared'
import { AppService } from '../../../../app.service'
import { XpertNewBlankComponent } from '../../xpert/index'
import { XpertStudioCreateToolComponent } from '../../tools/create/create.component'
import { EmojiAvatarComponent } from '../../../../@shared/avatar'
import { TagComponent } from '../../../../@shared'
import { XpertToolConfigureBuiltinComponent } from '../../tools'
import { XpertWorkspaceHomeComponent } from '../home/home.component'
import { injectParams } from 'ngxtension/inject-params'


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
    EmojiAvatarComponent,
    UserPipe,
    AppearanceDirective,
    TagComponent,
    CardCreateComponent,
    ToolsetCardComponent,
    ToolProviderCardComponent
  ],
  selector: 'pac-xpert-xperts',
  templateUrl: './xperts.component.html',
  styleUrl: 'xperts.component.scss',
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XpertStudioXpertsComponent {
  DisplayBehaviour = DisplayBehaviour
  eXpertTypeEnum = XpertTypeEnum

  readonly appService = inject(AppService)
  readonly router = inject(Router)
  readonly route = inject(ActivatedRoute)
  readonly logger = inject(NGXLogger)
  readonly #dialog = inject(MatDialog)
  readonly #toastr = inject(ToastrService)
  readonly workspaceService = inject(XpertWorkspaceService)
  readonly xpertService = inject(XpertService)
  readonly toolsetService = inject(XpertToolsetService)
  readonly homeComponent = inject(XpertWorkspaceHomeComponent)
  readonly workspaceId = injectParams('id')

  readonly contentContainer = viewChild('contentContainer', { read: ElementRef })

  readonly isMobile = this.appService.isMobile
  readonly lang = this.appService.lang

  readonly selectedWorkspaces = this.homeComponent.selectedWorkspaces
  // readonly workspace = this.homeComponent.workspace
  readonly type = this.homeComponent.type
  readonly tags = this.homeComponent.tags

  readonly refresh$ = new BehaviorSubject<void>(null)

  readonly workspace = derivedAsync(() => {
    return this.workspaceId() ? this.workspaceService.getOneById(this.workspaceId()) : null
  })
  readonly xperts = derivedAsync(() => {
    const where = {
      type: this.type(),
      latest: true
    }
    const workspaceId = this.workspaceId()
    return this.refresh$.pipe(
      switchMap(() =>
        this.xpertService.getAllByWorkspace(workspaceId, {
          where: omitBy(where, isNil),
          order: {updatedAt: OrderTypeEnum.DESC},
          relations: ['createdBy', 'tags']
        })
      ),
      map(({ items }) => items.filter((item) => item.latest))
    )
  })

  readonly #toolsets = derivedAsync(() => {
    const where = {
      category: this.type(),
      // type: 'openapi'
    }
    const workspaceId = this.workspaceId()
    return this.refresh$.pipe(
      switchMap(() =>
        this.toolsetService.getAllByWorkspace(workspaceId, {
          where: omitBy(where, isNil),
          relations: ['createdBy', 'tags']
        })
      ),
      map(({ items }) => items)
    )
  })

  readonly builtinToolProviders = derivedAsync(() => {
    return this.toolsetService.getProviders()
  })

  readonly toolsets = computed(() => {
    const tags = this.tags()
    return this.#toolsets()?.filter((toolset) => tags?.length ? tags.some((t) => toolset.tags.some((tt) => tt.name === t.name)) : true)
  })

  readonly isAll = computed(() => !this.type())
  readonly isXperts = computed(() => !this.type() || Object.values(XpertTypeEnum).includes(this.type() as XpertTypeEnum))
  readonly isTools = computed(() => this.type() === XpertToolsetCategoryEnum.API )
  readonly isBuiltinTools = computed(() => this.type() === XpertToolsetCategoryEnum.BUILTIN )

  readonly builtinToolsets = computed(() => this.toolsets()?.filter((_) => _.category === XpertToolsetCategoryEnum.BUILTIN))
  readonly apiToolsets = computed(() => this.toolsets()?.filter((_) => _.category === XpertToolsetCategoryEnum.API))


  constructor() {
    effect(() => {
      if (this.workspaceId()) {
        this.homeComponent.selectedWorkspaces.set([this.workspaceId()])
      }
    }, { allowSignalWrites: true })
  }

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
          this.router.navigate(['/xpert/', xpert.id])
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
      disableClose: true,
      data: {
      }
    })
    .afterClosed()
    .subscribe({
      next: (toolset) => {
        if (toolset) {
          this.refresh()
        }
      }
    })
  }

  configureToolBuiltin(provider: IToolProvider) {
    this.#dialog.open(XpertToolConfigureBuiltinComponent, {
      disableClose: true,
      data: {
        providerName: provider.name,
        workspace: this.workspace(),
      }
    }).afterClosed().subscribe((result) => {
      if (result) {
        this.refresh()
      }
    })
  }

  navigateTo(toolset: IXpertToolset) {
    if (toolset.category === XpertToolsetCategoryEnum.API) {
      this.router.navigate(['./tool', toolset.id], { relativeTo: this.route })
    } else {
      this.toolsetService.getOneById(toolset.id, { relations: ['tools'] }).pipe(
        switchMap((toolset) => this.#dialog.open(XpertToolConfigureBuiltinComponent, {
          disableClose: true,
          data: {
            toolset,
            providerName: toolset.type,
            workspace: this.workspace(),
          }
        }).afterClosed())
      )
      .subscribe((result) => {
        if (result) {
          this.refresh()
        }
      })
    }
  }
}
