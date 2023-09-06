import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { NgxPermissionsGuard } from 'ngx-permissions'
import { RolesEnum } from '../../../@core'
import { DemoComponent } from './demo/demo.component'
import { SettingsComponent } from './settings/settings.component'
import { PACTenantComponent } from './tenant.component'

export function redirectTo() {
  return '/dashboard'
}

const routes: Routes = [
  {
    path: '',
    component: PACTenantComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: [RolesEnum.SUPER_ADMIN],
        redirectTo
      }
    },
    children: [
      {
        path: '',
        redirectTo: 'settings',
        pathMatch: 'full'
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: 'demo',
        component: DemoComponent
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TenantRoutingModule {}
