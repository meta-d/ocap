import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MtxAlertModule } from '@ng-matero/extensions/alert'
import { TranslateModule } from '@ngx-translate/core'
import { ToastrService } from '@metad/cloud/state'
import { AcceptInviteFormComponent } from './accept-invite-form/accept-invite-form.component'
import { AcceptInvitePageComponent } from './accept-invite.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MtxAlertModule
  ],
  declarations: [AcceptInvitePageComponent, AcceptInviteFormComponent],
  exports: [AcceptInvitePageComponent],
  providers: [ToastrService]
})
export class AcceptInviteModule {}
