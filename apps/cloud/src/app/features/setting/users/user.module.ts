import { NgModule } from '@angular/core'
import { ButtonGroupDirective, OcapCoreModule } from '@metad/ocap-angular/core'
import { MtxCheckboxGroupModule } from '@ng-matero/extensions/checkbox-group'
import { NxTableModule } from '@metad/components/table'
import { InviteGuard } from '../../../@core/guards'
import { MaterialModule, SharedModule, UserProfileInlineComponent } from '../../../@shared'
import { UserFormsModule } from '../../../@shared/user/forms'
import { PACEditUserComponent } from './edit-user/edit-user.component'
import { ManageUserInviteComponent } from './manage-user-invite/manage-user-invite.component'
import { PACUserOrganizationsComponent } from './organizations/organizations.component'
import { UserBasicComponent } from './user-basic/user-basic.component'
import { UserRoutingModule } from './user-routing.module'
import { PACUsersComponent } from './users.component'
import { InlineSearchComponent } from '../../../@shared/form-fields'

@NgModule({
  declarations: [
    PACUsersComponent,
    PACEditUserComponent,
    UserBasicComponent,
    PACUserOrganizationsComponent,
    ManageUserInviteComponent
  ],
  providers: [InviteGuard],
  imports: [
    UserRoutingModule,
    SharedModule,
    MaterialModule,
    UserFormsModule,
    // Standard components
    ButtonGroupDirective,
    NxTableModule,
    MtxCheckboxGroupModule,
    InlineSearchComponent,
    // OCAP Modules
    OcapCoreModule,
    UserProfileInlineComponent
  ]
})
export class UserModule {}
