import { Routes } from '@angular/router'
import { NgxPermissionsGuard } from 'ngx-permissions'
import { AIPermissionsEnum, PermissionsEnum } from '../../../@core'
import { CopilotComponent } from './copilot.component'

export default [
  {
    path: '',
    component: CopilotComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      title: 'Settings / Copilot',
      permissions: {
        only: [AIPermissionsEnum.COPILOT_EDIT],
        redirectTo: '/settings'
      }
    },
    children: [
      {
        path: '',
        redirectTo: 'basic',
        pathMatch: 'full'
      },
      {
        path: 'basic',
        loadComponent: () => import('./basic/basic.component').then((m) => m.CopilotBasicComponent)
      },
      {
        path: 'examples',
        loadComponent: () => import('./examples/examples.component').then((m) => m.CopilotExamplesComponent),
        children: [
          {
            path: 'create',
            loadComponent: () => import('./example/example.component').then((m) => m.CopilotExampleComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./example/example.component').then((m) => m.CopilotExampleComponent)
          }
        ]
      },
      // {
      //   path: 'roles',
      //   component: CopilotRolesComponent,
      //   children: [
      //     {
      //       path: 'create',
      //       component: CopilotRoleComponent,
      //     },
      //     {
      //       path: ':id',
      //       component: CopilotRoleComponent,
      //     }
      //   ]
      // },
      {
        path: 'usages',
        loadComponent: () => import('./usages/usages.component').then((m) => m.CopilotUsagesComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users.component').then((m) => m.CopilotUsersComponent)
      },
    ]
  }
] as Routes
