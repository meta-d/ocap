import { CdkListboxModule } from '@angular/cdk/listbox'
import { CommonModule } from '@angular/common'
import { Component, inject, model } from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { ButtonGroupDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { debounceTime, map, of, switchMap, tap } from 'rxjs'
import {
  getErrorMessage,
  IXpertRole,
  IXpertWorkspace,
  ToastrService,
  uuid,
  XpertService,
  XpertTypeEnum
} from '../../../@core'
import { MaterialModule } from '../../../@shared'

@Component({
  selector: 'xpert-new-blank',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonGroupDirective, MaterialModule, FormsModule, CdkListboxModule],
  templateUrl: './blank.component.html',
  styleUrl: './blank.component.scss'
})
export class XpertNewBlankComponent {
  eXpertTypeEnum = XpertTypeEnum
  readonly #dialogRef = inject(MatDialogRef<XpertNewBlankComponent>)
  readonly #dialogData = inject<{ workspace: IXpertWorkspace }>(MAT_DIALOG_DATA)
  readonly xpertService = inject(XpertService)
  readonly #toastr = inject(ToastrService)

  readonly type = model<XpertTypeEnum>(XpertTypeEnum.Agent)
  readonly name = model<string>()
  readonly description = model<string>()

  public checking = false
  readonly validatedTitle = toSignal(
    toObservable(this.name).pipe(
      debounceTime(500),
      switchMap((title) => (title ? this.validateTitle(title).pipe(map((items) => !items.length)) : of(true)))
    )
  )

  validateTitle(title: string) {
    this.checking = true
    return this.xpertService.validateTitle(title).pipe(tap(() => (this.checking = false)))
  }

  create() {
    this.xpertService
      .create({
        type: this.type(),
        name: this.name(),
        description: this.description(),
        latest: true,
        workspaceId: this.#dialogData?.workspace?.id,
        agent: {
          key: uuid()
        }
      })
      .subscribe({
        next: (xpert) => {
          this.#toastr.success(`PAC.Messages.CreatedSuccessfully`, { Default: 'Created Successfully' })
          this.close(xpert)
        },
        error: (error) => {
          this.#toastr.error(getErrorMessage(error))
        }
      })
  }

  close(value?: IXpertRole) {
    this.#dialogRef.close(value)
  }
}
