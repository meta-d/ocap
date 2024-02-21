import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { NgxPermissionsGuard } from 'ngx-permissions'
import { AnalyticsPermissionsEnum, PermissionsEnum, RolesEnum } from '../../@core'
import { redirectTo } from '../features-routing.module'
import { PACAccountComponent } from './account/account.component'
import { PACAccountPasswordComponent } from './account/password.component'
import { PACAccountProfileComponent } from './account/profile.component'
import { PACSettingComponent } from './settings.component'

const routes: Routes = [
  {
    path: '',
    component: PACSettingComponent,
    data: { title: 'pac.menu.settings' },
    children: [
      // {
      //   path: '',
      //   redirectTo: 'general',
      //   pathMatch: 'full'
      // },
      {
        path: 'account',
        component: PACAccountComponent,
        data: {
          title: 'Settings / Account',
        },
        children: [
          {
            path: '',
            redirectTo: 'profile',
            pathMatch: 'full'
          },
          {
            path: 'profile',
            component: PACAccountProfileComponent
          },
          {
            path: 'password',
            component: PACAccountPasswordComponent
          }
        ]
      },
      {
        path: 'data-sources',
        loadChildren: () => import('./data-sources/data-sources.module').then((m) => m.PACDataSourcesModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [AnalyticsPermissionsEnum.DATA_SOURCE_EDIT],
            redirectTo
          }
        }
      },
      {
        path: 'users',
        loadChildren: () => import('./users/user.module').then((m) => m.UserModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [PermissionsEnum.ORG_USERS_VIEW],
            redirectTo
          }
        }
      },
      {
        path: 'business-area',
        loadChildren: () => import('./business-area/').then((m) => m.routes),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'business-area',
          permissions: {
            only: [AnalyticsPermissionsEnum.BUSINESS_AREA_EDIT],
            redirectTo
          }
        }
      },
      {
        path: 'certification',
        loadChildren: () => import('./certification/certification.module').then((m) => m.CertificationModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'certification',
          permissions: {
            only: [AnalyticsPermissionsEnum.BUSINESS_AREA_EDIT],
            redirectTo
          }
        }
      },

      {
        path: 'notification-destinations',
        loadChildren: () =>
          import('./notification-destination/notification-destination.module').then(
            (m) => m.NotificationDestinationModule
          ),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'notification-destinations',
          permissions: {
            only: [AnalyticsPermissionsEnum.BUSINESS_AREA_EDIT],
            redirectTo
          }
        }
      },

      {
        path: 'roles',
        loadChildren: () => import('./roles/roles.module').then((m) => m.RolesModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [PermissionsEnum.CHANGE_ROLES_PERMISSIONS],
            redirectTo
          }
        }
      },
      {
        path: 'features',
        canActivate: [NgxPermissionsGuard],
        data: {
          permissions: {
            only: [RolesEnum.SUPER_ADMIN],
            redirectTo
          }
        },
        loadChildren: () => import('./features/features.module').then((m) => m.FeaturesModule)
      },
      {
        path: 'tenant',
        loadChildren: () => import('./tenant/tenant.module').then((m) => m.TenantModule)
      },
      {
        path: 'organizations',
        loadChildren: () => import('./organizations/organizations.module').then((m) => m.OrganizationsModule)
      },
      {
        path: 'email-templates',
        loadChildren: () => import('./email-templates/email-templates.module').then((m) => m.EmailTemplatesModule)
      },
      {
        path: 'custom-smtp',
        loadChildren: () => import('./custom-smtp/custom-smtp.module').then((m) => m.CustomSmtpModule)
      },
      {
        path: 'copilot',
        loadChildren: () => import('./copilot/copilot.module').then((m) => m.CopilotModule),
        data: {
          title: 'Settings / Copilot',
        }
      }
    ]
  }
]

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule {}
