import { Routes } from '@angular/router'
import { NgxPermissionsGuard } from 'ngx-permissions'
import { PermissionsEnum } from '../../../@core'
import { KnowledgebaseHomeComponent } from './home.component'

export default [
  {
    path: '',
    component: KnowledgebaseHomeComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      title: 'Settings / Knowledgebase Home',
      permissions: {
        only: [PermissionsEnum.ORG_COPILOT_EDIT],
        redirectTo: '/settings'
      }
    },
    children: []
  },
  {
    path: ':id',
    loadChildren: () => import('./knowledgebase/routing').then((m) => m.default)
  }
] as Routes
