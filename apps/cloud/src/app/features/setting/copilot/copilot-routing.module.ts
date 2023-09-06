import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { PermissionsEnum } from '../../../@core'
import { CopilotComponent } from './copilot.component'

const routes: Routes = [
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
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CopilotRoutingModule {}
