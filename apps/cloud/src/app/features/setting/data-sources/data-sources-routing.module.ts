import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { PACDataSourcesComponent } from './data-sources.component'

const routes: Routes = [
  {
    path: '',
    component: PACDataSourcesComponent,
    data: {
      title: 'Settings / Datasource',
    }
  }
]

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PACDataSourcesRoutingModule {}
