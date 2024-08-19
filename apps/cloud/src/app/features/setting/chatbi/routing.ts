import { Routes } from '@angular/router'
import { NgxPermissionsGuard } from 'ngx-permissions'
import { PermissionsEnum } from '../../../@core'
import { ChatBIComponent } from './chatbi.component'

export default [
  {
    path: '',
    component: ChatBIComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      title: 'Settings / ChatBI',
      permissions: {
        only: [PermissionsEnum.ORG_COPILOT_EDIT],
        redirectTo: '/settings'
      }
    },
    children: [
      {
        path: '',
        redirectTo: 'models',
        pathMatch: 'full'
      },
      {
        path: 'models',
        loadComponent: () => import('./models/models.component').then((m) => m.ChatBIModelsComponent),
        children: [
          {
            path: 'create',
            loadComponent: () => import('./model/model.component').then((m) => m.ChatBIModelComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./model/model.component').then((m) => m.ChatBIModelComponent)
          }
        ]
      },
    ]
  }
] as Routes
