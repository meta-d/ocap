import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { NgxPermissionsGuard } from 'ngx-permissions'
import { AnalyticsPermissionsEnum } from '../../@core'
import { redirectTo } from '../features-routing.module'
import { MarketComponent } from './market/market.component'
import { ViewerComponent } from './viewer/viewer.component'

const routes: Routes = [
  {
    path: '',
    redirectTo: 'market',
    pathMatch: 'full'
  },
  {
    path: 'market',
    component: MarketComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      title: 'indicator-market',
      permissions: {
        only: [AnalyticsPermissionsEnum.INDICATOR_MARTKET_VIEW],
        redirectTo
      }
    }
  },
  {
    path: 'viewer/:id',
    component: ViewerComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      title: 'indicator-viewer',
      permissions: {
        only: [AnalyticsPermissionsEnum.INDICATOR_VIEW],
        redirectTo
      }
    }
  }
]

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PACIndicatorRoutingModule {}
