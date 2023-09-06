import { DragDropModule } from '@angular/cdk/drag-drop'
import { Component, Input, ViewChild } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { InvitationTypeEnum } from '@metad/contracts'
import { ButtonGroupDirective } from '@metad/ocap-angular/core'
import { MtxButtonModule } from '@ng-matero/extensions/button'
import { UntilDestroy } from '@ngneat/until-destroy'
import { TranslateModule } from '@ngx-translate/core'
import { InviteService } from '@metad/cloud/state'
import { getErrorMessage } from '../../../@core'
import { ToastrService } from '../../../@core/services'
import { EmailInviteFormComponent } from '../forms'
import { InviteFormsModule } from '../forms/invite-forms.module'
import { TranslationBaseComponent } from '../../language/translation-base.component'

@UntilDestroy({ checkProperties: true })
@Component({
  standalone: true,
  imports: [
    FormsModule,
    TranslateModule,
    MatDialogModule,
    MatButtonModule,
    DragDropModule,
    MtxButtonModule,
    ButtonGroupDirective,

    InviteFormsModule
  ],
  selector: 'pac-invite-mutation',
  templateUrl: './invite-mutation.component.html',
  styleUrls: ['./invite-mutation.component.scss']
})
export class InviteMutationComponent extends TranslationBaseComponent {
  /*
   * Getter & Setter for InvitationTypeEnum
   */
  _invitationType: InvitationTypeEnum = InvitationTypeEnum.USER
  get invitationType(): InvitationTypeEnum {
    return this._invitationType
  }
  @Input() set invitationType(value: InvitationTypeEnum) {
    this._invitationType = value
  }

  @ViewChild('emailInviteForm')
  emailInviteForm: EmailInviteFormComponent

  constructor(
    private readonly toastrService: ToastrService,
    private readonly inviteService: InviteService,
    private _dialogRef: MatDialogRef<InviteMutationComponent>
  ) {
    super()
  }

  async onApply() {
    try {
      const result = await this.emailInviteForm.saveInvites()

      this.toastrService.success('TOASTR.MESSAGE.INVITES_RESULT', {
        ...result,
        Default: `Invites ${result.total}, ignored ${result.ignored}`
      })
    } catch (err) {
      this.toastrService.success(getErrorMessage(err))
    }
  }
}
