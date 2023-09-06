import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { OrganizationComponent } from './organization.component'

const routes: Routes = [
  {
    path: ':id',
    component: OrganizationComponent,
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule {}
