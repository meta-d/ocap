import { CommonModule } from '@angular/common'
import { ChangeDetectorRef, Component, inject } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog'
import { NgmSearchComponent } from '@metad/ocap-angular/common'
import { AppearanceDirective, ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { TranslateModule } from '@ngx-translate/core'
import { ConfirmDeleteComponent } from '@metad/components/confirm'
import { Subscription, firstValueFrom, of, switchMap, tap } from 'rxjs'
import { IStorageFile, ProjectService, StorageFileService, ToastrService, listAnimation } from '../../../@core'
import { MaterialModule } from '../../material.module'

@UntilDestroy({ checkProperties: true })
@Component({
  standalone: true,
  selector: 'pac-project-files',
  templateUrl: './project-files.component.html',
  styleUrls: ['project-files.component.scss'],
  providers: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TranslateModule,
    ButtonGroupDirective,
    AppearanceDirective,
    DensityDirective,
    NgmSearchComponent
  ],
  animations: [listAnimation]
})
export class ProjectFilesComponent {
  private readonly _dialogRef = inject(MatDialogRef<ProjectFilesComponent>)
  private readonly _dialog = inject(MatDialog)
  private readonly _data = inject<{ projectId: string }>(MAT_DIALOG_DATA)
  private readonly _toastrService = inject(ToastrService)
  private readonly _cdr = inject(ChangeDetectorRef)
  private readonly projectService = inject(ProjectService)
  private readonly storageFileService = inject(StorageFileService)

  public files: IStorageFile[]
  public activedFile = null

  private uploadSubscribtion: Subscription
  file: File | null = null
  isLoading = false
  constructor() {
    this.projectService.getOne(this._data.projectId, ['files']).subscribe((project) => {
      console.log(project)
      this.files = project.files
    })
  }

  activeLink(file: IStorageFile) {
    this.activedFile = file
  }

  onFileSelected(event: Event): void {
    this.file = (event.target as HTMLInputElement).files?.[0]
    if (this.file) {
      this.isLoading = true
      this.uploadSubscribtion = of(this.file)
        .pipe(
          switchMap((file) => {
            const formData = new FormData()
            formData.append('file', file)
            return this.storageFileService.create(formData)
          }),
          switchMap((file: any | IStorageFile) => {
            return this.projectService
              .updateFiles(
                this._data.projectId,
                [...this.files, file].map(({ id }) => id)
              )
              .pipe(
                tap(() => {
                  this.files = [...this.files, file]
                })
              )
          })
        )
        .subscribe({
          next: (project) => {
            this.isLoading = false
            this._cdr.detectChanges()
          },
          error: (err) => {
            this.isLoading = false
            this._cdr.detectChanges()
          }
        })
    }
  }

  async deleteFile(event, file: IStorageFile) {
    event.stopPropagation()
    const confirm = await firstValueFrom(
      this._dialog.open(ConfirmDeleteComponent, { data: { value: file.originalName } }).afterClosed()
    )

    if (!confirm) return

    try {
      await firstValueFrom(this.projectService.removeFile(this._data.projectId, file.id))
      this.files = this.files.filter(({ id }) => id !== file.id)
      this._cdr.detectChanges()
    } catch (error) {
      this._toastrService.error(error)
    }
  }

  isImage(file: IStorageFile) {
    return file.mimetype?.startsWith('image')
  }
}
