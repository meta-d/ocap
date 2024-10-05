import { Routes } from '@angular/router'
import { XpertAgentHomeComponent } from './home.component'

export const routes: Routes = [
  {
    path: '**',
    component: XpertAgentHomeComponent,
  },
]
