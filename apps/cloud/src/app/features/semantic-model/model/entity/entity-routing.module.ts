import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ModelEntityCalculationComponent } from './calculation/calculation.component'
import { ModelEntityComponent } from './entity.component'
import { EntityQueryComponent } from './query/query.component'
import { ModelEntityStructureComponent } from './structure/structure.component'

const routes: Routes = [
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
        redirectTo: 'calculation/',
      },
      {
        path: 'calculation/:id',
        component: ModelEntityCalculationComponent,
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModelEntityRoutingModule {}
