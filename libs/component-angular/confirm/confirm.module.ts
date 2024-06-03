import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { ButtonGroupDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { CountdownModule } from '@metad/components/countdown'
import { ConfirmDeleteComponent } from './confirm-delete/confirm-delete.component'
import { ConfirmSnackBar } from './confirm-snackbar/confirm-snack-bar.component'
import { CountdownConfirmationComponent } from './countdown/countdown.component'

/**
 * @deprecated use `@metad/ocap-angular/common`
 */
@NgModule({
  declarations: [ ConfirmDeleteComponent, CountdownConfirmationComponent, ConfirmSnackBar],
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    CountdownModule,
    TranslateModule,

    ButtonGroupDirective
  ],
  exports: [ ConfirmDeleteComponent, CountdownConfirmationComponent, ConfirmSnackBar]
})
export class ConfirmModule {}
