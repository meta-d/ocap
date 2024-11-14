import { Routes } from '@angular/router'
import { NgxPermissionsGuard } from 'ngx-permissions'
import { AIPermissionsEnum, PermissionsEnum } from '../../../@core'
import { XpertHomeComponent } from './home.component'
import { XpertRolesComponent } from './roles/roles.component'
import { XpertRoleComponent } from './role/role.component'
import { XpertToolsetsComponent } from './toolsets/toolsets.component'

export default [
  {
    path: '',
    component: XpertHomeComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      title: 'Settings / Xpert',
      permissions: {
        only: [AIPermissionsEnum.COPILOT_EDIT],
        redirectTo: '/settings'
      }
    },
    children: [
      {
        path: '',
        redirectTo: 'roles',
        pathMatch: 'full'
      },
      {
        path: 'roles',
        component: XpertRolesComponent,
        children: [
          {
            path: 'create',
            component: XpertRoleComponent,
          },
          {
            path: ':id',
            component: XpertRoleComponent,
          }
        ]
      },
      {
        path: 'toolsets',
        component: XpertToolsetsComponent,
      },
    ]
  }
] as Routes
