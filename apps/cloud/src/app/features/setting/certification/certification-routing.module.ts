import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { AnalyticsPermissionsEnum, PermissionsEnum } from '../../../@core'
import { CertificationComponent } from './certification.component'

const routes: Routes = [
  {
    path: '',
    component: CertificationComponent,
    data: {
      title: 'Settings / Certification',
      permissions: {
        only: [AnalyticsPermissionsEnum.CERTIFICATION_EDIT],
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
