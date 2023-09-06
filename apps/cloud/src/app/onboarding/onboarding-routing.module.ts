import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { OnboardingComponent } from './onboarding.component'
import { WelcomeComponent } from './welcome/welcome.component'

const routes: Routes = [
  {
    path: '',
    component: OnboardingComponent,
    children: [
      {
        path: '',
        component: WelcomeComponent
      },
      {
        path: 'tenant',
        loadChildren: () => import('./tenant-details/tenant-details.module').then((m) => m.TenantDetailsModule)
      },
      {
        path: 'complete',
        loadChildren: () =>
          import('./onboarding-complete/onboarding-complete.module').then((m) => m.OnboardingCompleteModule)
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnboardingRoutingModule {}
