import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { TenantDetailsComponent } from './tenant-details.component'

const routes: Routes = [
  {
    path: '',
    component: TenantDetailsComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TenantDetailsRoutingModule {}
