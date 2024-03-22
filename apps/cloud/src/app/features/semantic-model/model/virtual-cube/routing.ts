import { Routes } from '@angular/router'
import { VirtualCubeComponent } from './virtual-cube.component'

export const routes: Routes = [
  {
    path: ':id',
    component: VirtualCubeComponent
  }
]
