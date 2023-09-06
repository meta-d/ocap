import { Component, OnInit, inject } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

@Component({
  selector: 'pac-formatting',
  templateUrl: './formatting.component.html',
  styleUrls: ['./formatting.component.scss'],
  host: {
    class: 'nx-dialog-container'
  }
})
export class FormattingComponent implements OnInit {
  public data = inject(MAT_DIALOG_DATA)
  public dialogRef? = inject(MatDialogRef<FormattingComponent>)

  formGroup = new FormGroup({
    shortNumber: new FormControl<boolean>(false),
    decimal: new FormControl<number>(null),
    unit: new FormControl<string>(null),
    useUnderlyingUnit: new FormControl<boolean>(false),
    digitsInfo: new FormControl<string>(null),
  })

  ngOnInit(): void {
    if (this.data) {
      this.formGroup.patchValue(this.data)
    }
  }

  onApply() {
    this.dialogRef.close(this.formGroup.value)
  }
}
