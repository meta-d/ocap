import { A11yModule } from '@angular/cdk/a11y'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { Component, HostBinding, OnInit, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { ButtonGroupDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { isString } from 'lodash-es'

/**
 * @deprecated use `@metad/ocap-angular/common`
 */
@Component({
  standalone: true,
  imports: [
    CommonModule,
    A11yModule,
    FormsModule,
    DragDropModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,

    ButtonGroupDirective
  ],
  selector: 'ngm-confirm-unique',
  templateUrl: './confirm-unique.component.html',
  styleUrls: ['./confirm-unique.component.scss']
})
export class ConfirmUniqueComponent implements OnInit {
  @HostBinding('class.ngm-dialog-container') isDialogContainer = true

  public data = inject<string | { title: string; value: string }>(MAT_DIALOG_DATA)
  private _dialogRef = inject(MatDialogRef<ConfirmUniqueComponent>)

  value: string
  title: string

  ngOnInit(): void {
    this.reset()
  }

  reset() {
    if (isString(this.data)) {
      this.value = this.data
    } else {
      this.value = this.data?.value
      this.title = this.data?.title
    }
  }

  onSubmit() {
    this._dialogRef.close(this.value)
  }
}
