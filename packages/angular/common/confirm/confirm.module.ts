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
import { NgmConfirmDeleteComponent } from './confirm-delete/confirm-delete.component'
import { NgmConfirmSnackBar } from './confirm-snackbar/confirm-snack-bar.component'
import { NgmCountdownConfirmationComponent } from './countdown/countdown.component'
import { NgmCountdownModule } from '../countdown'
import { NgmConfirmOptionsComponent } from './confirm-options/confirm-options.component'

@NgModule({
  declarations: [ NgmConfirmDeleteComponent, NgmCountdownConfirmationComponent, NgmConfirmSnackBar ],
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    NgmCountdownModule,
    TranslateModule,

    ButtonGroupDirective,
    NgmConfirmOptionsComponent
  ],
  exports: [ NgmConfirmDeleteComponent, NgmCountdownConfirmationComponent, NgmConfirmSnackBar, NgmConfirmOptionsComponent ]
})
export class NgmConfirmModule {}
