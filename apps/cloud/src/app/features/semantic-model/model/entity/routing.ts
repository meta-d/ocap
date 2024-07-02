import { Routes } from '@angular/router'
import { NotFoundComponent } from 'apps/cloud/src/app/@shared'
import { ModelEntityCalculationComponent } from './calculation/calculation.component'
import { ModelEntityComponent } from './entity.component'
import { ModelEntityPreviewComponent } from './preview/preview.component'
import { EntityQueryComponent } from './query/query.component'
import { ModelEntityStructureComponent } from './structure/structure.component'

export const routes: Routes = [
  {
    path: '404',
    component: NotFoundComponent
  },
  {
    path: ':id',
    component: ModelEntityComponent,
    children: [
      {
        path: '',
        redirectTo: 'structure',
        pathMatch: 'full'
      },
      {
        path: 'structure',
        component: ModelEntityStructureComponent,
        data: {
          title: 'Model / Cube / Structure'
        }
      },
      {
        path: 'calculation',
        redirectTo: 'calculation/'
      },
      {
        path: 'calculation/404',
        component: NotFoundComponent
      },
      {
        path: 'calculation/:id',
        component: ModelEntityCalculationComponent
      },
      {
        path: 'preview',
        component: ModelEntityPreviewComponent
      },
      {
        path: 'query',
        component: EntityQueryComponent,
        data: {
          reuseRoute: true
        }
      }
    ]
  }
]
