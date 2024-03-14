import { animate, state, style, transition, trigger } from '@angular/animations'
import { CommonModule } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { NgmTableComponent } from '@metad/ocap-angular/common'
import { AppearanceDirective, ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { BehaviorSubject, map, switchMap } from 'rxjs'
import { IStorageFile, ProjectService, Store, ToastrService } from '../../../@core'
import {
  MaterialModule,
  ProjectFilesDialogComponent,
  UserProfileComponent,
  UserProfileInlineComponent,
  UserRoleSelectComponent,
  userLabel
} from '../../../@shared'
import { InlineSearchComponent } from '../../../@shared/form-fields'
import { ProjectComponent } from '../project.component'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    TranslateModule,
    UserRoleSelectComponent,
    InlineSearchComponent,
    UserProfileComponent,
    UserProfileInlineComponent,
    ButtonGroupDirective,
    DensityDirective,
    AppearanceDirective,
    NgmTableComponent
  ],
  selector: 'pac-project-files',
  templateUrl: 'files.component.html',
  styleUrl: 'files.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class ProjectFilesComponent {
  userLabel = userLabel

  // Injectors
  private projectService = inject(ProjectService)
  private projectComponent = inject(ProjectComponent)
  private store = inject(Store)
  private _dialog = inject(MatDialog)
  private _toastrService = inject(ToastrService)

  searchControl = new FormControl()

  get isOwner() {
    return this.store.user?.id === this.project()?.ownerId
  }

  public readonly refresh$ = new BehaviorSubject<void>(null)

  readonly project = this.projectComponent.projectSignal
  readonly projectId = toSignal(this.projectComponent.projectId$)

  readonly files = signal([])

  columnsToDisplay = ['originalName', 'mimetype', 'size', 'encoding', 'createdAt', 'createdByUser']
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand']
  expandedElement: IStorageFile[] | null

  #projectFilesSub = this.refresh$
    .pipe(
      switchMap(() =>
        this.projectComponent.projectId$.pipe(
          switchMap((id) => this.projectService.getOne(this.projectId(), ['files', 'files.createdBy'])),
          map((project) => project.files)
        )
      )
    )
    .subscribe((files) => {
      this.files.set(
        files.map((file) => ({
          ...file,
          createdByUser: userLabel(file.createdBy)
        }))
      )
    })

  openMaterials() {
    this._dialog
      .open(ProjectFilesDialogComponent, {
        panelClass: 'medium',
        data: {
          projectId: this.projectId()
        }
      })
      .afterClosed()
      .subscribe((result) => {
        this.refresh$.next()
      })
  }

  isImage(file: IStorageFile) {
    return file.mimetype?.startsWith('image')
  }
}