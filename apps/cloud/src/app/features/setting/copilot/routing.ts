import { Routes } from '@angular/router'
import { PermissionsEnum } from '../../../@core'
import { CopilotComponent } from './copilot.component'

export default [
  {
    path: '',
    component: CopilotComponent,
    data: {
      title: 'Settings / Copilot',
      permissions: {
        only: [PermissionsEnum.ORG_COPILOT_EDIT],
        redirectTo: '/settings'
      }
    },
    children: []
  }
] as Routes
