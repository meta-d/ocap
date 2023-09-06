import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { IndicatoryMarketComponent } from './indicator-market.component'

const routes: Routes = [
  {
    path: '',
    component: IndicatoryMarketComponent,
    data: {
      title: 'indicator-app'
    }
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IndicatorMarketRoutingModule {}
