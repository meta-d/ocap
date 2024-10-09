import { Routes } from '@angular/router'
import { XpertHomeComponent } from './home.component'
import { XpertStudioComponent } from './studio/studio.component'

export const routes: Routes = [
  {
    path: '',
    component: XpertHomeComponent,
  },
  {
    path: ':id',
    component: XpertStudioComponent,
  },
  {
    path: '**',
    component: XpertHomeComponent,
  },
]
