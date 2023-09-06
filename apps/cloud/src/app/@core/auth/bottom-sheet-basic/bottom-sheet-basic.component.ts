import { CommonModule } from '@angular/common'
import { Component, Inject } from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { ButtonGroupDirective, OcapCoreModule } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { ToastrService } from '@metad/cloud/state'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    TranslateModule,

    ButtonGroupDirective,
    OcapCoreModule
  ],
  selector: 'bottom-sheet-basic',
  templateUrl: 'bottom-sheet-basic.component.html'
})
export class BottomSheetBasicAuthComponent {
  form = new FormGroup({
    username: new FormControl(['']),
    password: new FormControl(['']),
    remeberMe: new FormControl(true)
  })
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {name: string, ping: (auth: any) => Promise<any>},
    private _bottomSheetRef: MatBottomSheetRef<BottomSheetBasicAuthComponent>,
    private toastrService: ToastrService
  ) {}

  async onSubmit() {
    try {
      await this.data.ping({...this.form.value})
      this._bottomSheetRef.dismiss(this.form.value)
    } catch(err) {
      this.toastrService.error('用户认证失败')
    }
  }

  onCancel() {
    this._bottomSheetRef.dismiss()
  }

}
