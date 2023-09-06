import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { QueryLabComponent } from './query-lab.component'
import { QueryComponent } from './query/query.component'
import { DirtyCheckGuard } from 'apps/cloud/src/app/@core'

const routes: Routes = [
  {
    path: '',
    component: QueryLabComponent,
    canDeactivate: [DirtyCheckGuard],
    children: [
      {
        path: ':id',
        component: QueryComponent,
        data: {
          title: 'Model / Query / ID'
        }
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QueryLabRoutingModule {}
