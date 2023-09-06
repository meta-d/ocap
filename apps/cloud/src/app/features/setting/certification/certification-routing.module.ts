import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { PermissionsEnum } from '../../../@core'
import { CertificationComponent } from './certification.component'

const routes: Routes = [
  {
    path: '',
    component: CertificationComponent,
    data: {
      title: 'Settings / Certification',
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
export class CertificationRoutingModule {}
