import { Component } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { FieldType } from '@ngx-formly/core'
import { ConfirmCodeEditorComponent } from '@metad/components/editor'
import { isUndefined } from 'lodash-es'
import { firstValueFrom } from 'rxjs'


@Component({
  selector: 'pac-formly-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class PACFormlyCodeEditorComponent extends FieldType {

  constructor(public dialog: MatDialog) {
    super()
  }

  async openCodeEditorDialog() {
    const result = await firstValueFrom(
      this.dialog.open(ConfirmCodeEditorComponent, {
        panelClass: 'large',
        data: {
          model: this.field.formControl.value,
          language: this.props?.language,
          onApply: (model) => {
            this.field.formControl.setValue(model)
          }
        }
      }).afterClosed()
    )
    if (!isUndefined(result)) {
      this.field.formControl.setValue(result)
    }
  }

}
