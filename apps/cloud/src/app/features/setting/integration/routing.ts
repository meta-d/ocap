import { Routes } from '@angular/router'
import { NgxPermissionsGuard } from 'ngx-permissions'
import { PermissionsEnum } from '../../../@core'
import { IntegrationHomeComponent } from './home.component'
import { IntegrationComponent } from './integration/integration.component'

export default [
  {
    path: '',
    component: IntegrationHomeComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      title: 'Settings / Integration Home',
      permissions: {
        only: [PermissionsEnum.INTEGRATION_EDIT],
        redirectTo: '/settings'
      }
    },
  },
  {
    path: 'create',
    component: IntegrationComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      title: 'Settings / Integration New',
      permissions: {
        only: [PermissionsEnum.INTEGRATION_EDIT],
        redirectTo: '/settings/integration'
      }
    },
  },
  {
    path: ':id',
    component: IntegrationComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      title: 'Settings / Integration Edit',
      permissions: {
        only: [PermissionsEnum.INTEGRATION_EDIT],
        redirectTo: '/settings/integration'
      }
    },
  }
] as Routes
