import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ModelDimensionComponent } from './dimension.component'
import { ModelHierarchyComponent } from './hierarchy/hierarchy.component'


const routes: Routes = [
  {
    path: ':id',
    component: ModelDimensionComponent,
    children: [
      {
        path: 'hierarchy',
        redirectTo: '',
        pathMatch: 'full'
      },
      {
        path: 'hierarchy/:id',
        component: ModelHierarchyComponent,
        data: {
          title: 'Model / Dimension / Hierarchy',
          reuseComponent: false
        }
      }

    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModelDimensionRoutingModule {}
