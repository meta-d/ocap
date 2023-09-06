import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { PermissionsEnum } from '@metad/contracts'
import { InviteGuard } from '../../../@core/guards'
import { PACEditUserComponent } from './edit-user/edit-user.component'
import { ManageUserInviteComponent } from './manage-user-invite/manage-user-invite.component'
import { PACUserOrganizationsComponent } from './organizations/organizations.component'
import { UserBasicComponent } from './user-basic/user-basic.component'
import { PACUsersComponent } from './users.component'

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
    path: 'invites',
    component: ManageUserInviteComponent,
    canActivate: [InviteGuard],
		data: {
      title: 'Settings/User/Invites',
			expectedPermissions: [
				PermissionsEnum.ORG_INVITE_EDIT,
				PermissionsEnum.ORG_INVITE_VIEW
			]
		}
  },
  {
    path: '',
    component: PACUsersComponent,
    data: {
      title: 'Settings/User',
    },
    children: [
      {
        path: ':id',
        component: PACEditUserComponent
      }
    ]
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}
