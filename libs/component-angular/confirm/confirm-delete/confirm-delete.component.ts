import { Component, HostBinding, inject } from '@angular/core'
import { MAT_DIALOG_DATA } from '@angular/material/dialog'

/**
 * @deprecated use `@metad/ocap-angular/common`
 */
@Component({
  selector: 'ngm-confirm-delete',
  templateUrl: './confirm-delete.component.html',
  styleUrls: ['./confirm-delete.component.scss']
})
export class ConfirmDeleteComponent {
  readonly data = inject<{ value: any; information: string }>(MAT_DIALOG_DATA)

  @HostBinding('class.ngm-dialog-container') isDialogContainer = true
}
