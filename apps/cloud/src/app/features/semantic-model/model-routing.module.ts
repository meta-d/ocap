import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ModelsComponent } from './models/models.component'

const routes: Routes = [
  {
    path: '',
    component: ModelsComponent,
    data: {
      title: 'semanctic-models'
    }
  },
  {
    path: ':id',
    loadChildren: () => import('./model/model.module').then((m) => m.ModelModule),
    data: {
      title: 'semanctic-model'
    }
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SemanticModelRoutingModule {}
