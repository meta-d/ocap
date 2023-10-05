import { A11yModule } from '@angular/cdk/a11y'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { Component, HostBinding, Inject, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { ButtonGroupDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'

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

  value: string
  constructor(@Inject(MAT_DIALOG_DATA) public data: string, private _dialogRef: MatDialogRef<ConfirmUniqueComponent>) {}

  ngOnInit(): void {
    this.value = this.data
  }

  reset() {
    this.value = this.data
  }

  onSubmit(event) {
    this._dialogRef.close(this.value)
  }
}
