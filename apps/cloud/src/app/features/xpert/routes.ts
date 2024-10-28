import { Routes } from '@angular/router'
import { XpertHomeComponent } from './home.component'
import { XpertStudioComponent } from './studio/studio.component'
import { XpertStudioXpertsComponent } from './xperts/xperts.component'
import { XpertStudioToolsComponent } from './tools/tools.component'
import { XpertStudioAPIToolComponent } from './tools'
import { XpertDevelopComponent, XpertStudioXpertComponent } from './xpert'

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
    path: 'tool/:id',
    component: XpertStudioAPIToolComponent,
  },
  {
    path: ':id',
    component: XpertStudioXpertComponent,
    children: [
      {
        path: '',
        redirectTo: 'agents',
        pathMatch: 'full'
      },
      {
        path: 'agents',
        component: XpertStudioComponent
      },
      {
        path: 'develop',
        component: XpertDevelopComponent
      },
    ]
  },
  {
    path: '**',
    component: XpertHomeComponent,
  },
]
