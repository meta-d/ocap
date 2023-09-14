import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { NgxPermissionsGuard } from 'ngx-permissions'
import { PermissionsEnum } from '../../../@core'
import { EditOrganizationComponent } from './edit-organization/edit-organization.component'
import { OrganizationsComponent } from './organizations.component'
import { AllOrganizationsComponent } from './organizations/organizations.component'

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
    },
    children: [
      {
        path: ':id',
        component: EditOrganizationComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [PermissionsEnum.ALL_ORG_EDIT],
            redirectTo
          }
        }
      },
      {
        path: '',
        component: AllOrganizationsComponent
      }
    ]
  }
  // {
  //   path: 'edit/:id',
  //   component: EditOrganizationComponent,
  //   canActivate: [NgxPermissionsGuard],
  //   data: {
  //     permissions: {
  //       only: [PermissionsEnum.ALL_ORG_EDIT],
  //       redirectTo
  //     }
  //   },
  //   children: [
  //     {
  //       path: '',
  //       redirectTo: 'main',
  //       pathMatch: 'full'
  //     },
  //     {
  //       path: 'main',
  //       component: EditOrganizationMainComponent,
  //       data: {
  //         selectors: {
  //           project: false,
  //           employee: false,
  //           date: false
  //         }
  //       }
  //     },
  //     {
  //       path: 'demo',
  //       component: OrganizationDemoComponent
  //     }
  //   ]
  // },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationsRoutingModule {}
