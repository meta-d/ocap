import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { VirtualCubeComponent } from './virtual-cube.component'

const routes: Routes = [
  {
    path: ':id',
    component: VirtualCubeComponent,
    children: [
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VirtualCubeRoutingModule {}
