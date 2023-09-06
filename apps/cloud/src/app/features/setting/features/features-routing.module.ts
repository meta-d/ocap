import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { FeatureToggleComponent } from '../../../@shared/feature-toggle'
import { PACFeaturesComponent } from './features.component'

const routes: Routes = [
  {
    path: '',
    component: PACFeaturesComponent,
    children: [
      {
        path: '',
        redirectTo: 'tenant',
        pathMatch: 'full'
      },
      {
        path: 'tenant',
        component: FeatureToggleComponent,
        data: {
          isOrganization: false
        }
      },
      {
        path: 'organization',
        component: FeatureToggleComponent,
        data: {
          isOrganization: true
        }
      }
    ]
  }
]

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeaturesRoutingModule {}
