import { Routes } from '@angular/router'
import { XpertHomeComponent } from './home.component'
import { XpertStudioComponent } from './studio/studio.component'
import { XpertStudioXpertsComponent } from './xperts/xperts.component'
import { XpertStudioToolsComponent } from './tools/tools.component'

export const routes: Routes = [
  {
    path: '',
    component: XpertHomeComponent,
    children: [
      {
        path: '',
        component: XpertStudioXpertsComponent
      },
      {
        path: 'tools',
        component: XpertStudioToolsComponent
      }
    ]
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
