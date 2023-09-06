import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { NgxPermissionsGuard } from 'ngx-permissions'
import { PermissionsEnum } from '../../../@core'
import { EditOrganizationMainComponent } from './edit-organization/edit-organization-settings/edit-organization-main/edit-organization-main.component'
import { EditOrganizationSettingsModule } from './edit-organization/edit-organization-settings/edit-organization-settings.module'
import { EditOrganizationComponent } from './edit-organization/edit-organization.component'
import { OrganizationDemoComponent } from './organization-demo/organization-demo.component'
import { OrganizationsComponent } from './organizations.component'

export function redirectTo() {
  return '/dashboard'
}

const routes: Routes = [
  {
    path: '',
    component: OrganizationsComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [PermissionsEnum.ALL_ORG_VIEW],
        redirectTo
      },
      selectors: {
        project: false,
        employee: false,
        organization: false,
        date: false
      }
    }
  },
  {
    path: 'edit/:id',
    component: EditOrganizationComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [PermissionsEnum.ALL_ORG_EDIT],
        redirectTo
      }
    },
    children: [
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      {
        path: 'main',
        component: EditOrganizationMainComponent,
        data: {
          selectors: {
            project: false,
            employee: false,
            date: false
          }
        }
      },
      {
        path: 'demo',
        component: OrganizationDemoComponent
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes), EditOrganizationSettingsModule],
  exports: [RouterModule]
})
export class OrganizationsRoutingModule {}
