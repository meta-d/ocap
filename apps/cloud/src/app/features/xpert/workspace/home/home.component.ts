import { DragDropModule } from '@angular/cdk/drag-drop'
import { CdkListboxModule } from '@angular/cdk/listbox'
import { CdkMenuModule } from '@angular/cdk/menu'
import {OverlayModule} from '@angular/cdk/overlay';
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
} from '@metad/ocap-angular/common'
import { DisplayBehaviour } from '@metad/ocap-core'
import { IntersectionObserverModule } from '@ng-web-apis/intersection-observer'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { BehaviorSubject, EMPTY } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import {
  getErrorMessage,
  injectUser,
  ITag,
  routeAnimations,
  ToastrService,
  XpertService,
  XpertToolsetCategoryEnum,
  XpertToolsetService,
  XpertTypeEnum,
  XpertWorkspaceService
} from '../../../../@core'
import { MaterialModule, TagFilterComponent } from '../../../../@shared'
import { AppService } from '../../../../app.service'
import { XpertWorkspaceSettingsComponent } from '../settings/settings.component';

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
    OverlayModule,
    RouterModule,
    TranslateModule,
    IntersectionObserverModule,
    MaterialModule,

    NgmCommonModule,
    TagFilterComponent
  ],
  selector: 'pac-xpert-home',
  templateUrl: './home.component.html',
  styleUrl: 'home.component.scss',
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XpertWorkspaceHomeComponent {
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
  readonly me = injectUser()

  readonly contentContainer = viewChild('contentContainer', { read: ElementRef })

  readonly isMobile = this.appService.isMobile
  readonly lang = this.appService.lang

  readonly workspaces = toSignal(this.workspaceService.getAllMy().pipe(map(({ items }) => items)), {initialValue: null})
  readonly selectedWorkspaces = model<string[]>([])
  readonly workspace = computed(() => this.workspaces()?.find((_) => _.id === this.selectedWorkspaces()[0]), {
    equal: (a, b) => a?.id === b?.id
  })

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

  readonly inDevelopmentOpen = signal(false)

  constructor() {
    effect(() => {
      if (this.selectedWorkspaces()[0]) {
        this.router.navigate(['/xpert/w/', this.selectedWorkspaces()[0]])
      }
    }, { allowSignalWrites: true })
  }

  newWorkspace() {
    this.#dialog
      .open(NgmConfirmUniqueComponent, {
        data: {
          title: this.#translate.instant('PAC.Xpert.NewWorkspace', {Default: 'New Workspace'})
        }
      })
      .afterClosed()
      .pipe(switchMap((name) => (name ? this.workspaceService.create({ name }) : EMPTY)))
      .subscribe({
        next: (workspace) => {
          this.workspaceService.refresh()
          this.selectedWorkspaces.set([workspace.id])
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
      .open(XpertWorkspaceSettingsComponent, {
        data: {
          id: this.selectedWorkspaces()[0]
        }
      })
      .afterClosed()
      .subscribe()
  }
}
