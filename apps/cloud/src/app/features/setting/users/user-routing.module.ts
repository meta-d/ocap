import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { PermissionsEnum } from '@metad/contracts'
import { inviteGuard } from '../../../@core/guards'
import { PACEditUserComponent } from './edit-user/edit-user.component'
import { ManageUserInviteComponent } from './manage-user-invite/manage-user-invite.component'
import { PACUserOrganizationsComponent } from './organizations/organizations.component'
import { UserBasicComponent } from './user-basic/user-basic.component'
import { PACUsersComponent } from './users.component'
import { ManageUserComponent } from './manage-user/manage-user.component'

const routes: Routes = [
  {
    path: 'edit/:id',
    component: PACEditUserComponent,
    data: {
      title: 'Settings/User/Edit'
    },
    children: [
      {
        path: '',
        component: UserBasicComponent,
        data: {
          allowRoleChange: true
        }
      },
      {
        path: 'organizations',
        component: PACUserOrganizationsComponent
      }
    ]
  },
  {
    path: '',
    component: PACUsersComponent,
    data: {
      title: 'Settings/User',
    },
    children: [
      {
        path: '',
        component: ManageUserComponent
      },
      {
        path: 'invites',
        component: ManageUserInviteComponent,
        canActivate: [inviteGuard],
        data: {
          title: 'Settings/User/Invites',
          expectedPermissions: [
            PermissionsEnum.ORG_INVITE_EDIT,
            PermissionsEnum.ORG_INVITE_VIEW
          ]
        }
      },
      {
        path: ':id',
        component: PACEditUserComponent,
        data: {
          title: 'Settings/User/Edit'
        },
      }
    ]
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}
