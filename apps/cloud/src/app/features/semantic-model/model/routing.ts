import { RouterModule, Routes } from '@angular/router'
import { DirtyCheckGuard } from '../../../@core'
import { ModelMembersComponent } from './members/members.component'
import { ModelComponent } from './model.component'
import { ModelOverviewComponent } from './overview/overview.component'
import { StoryModelResolver } from './story-model.resolver'
import { NgModule } from '@angular/core'

export const routes: Routes = [
  {
    path: '',
    component: ModelComponent,
    resolve: { storyModel: StoryModelResolver },
    canDeactivate: [DirtyCheckGuard],
    data: {
      reuseComponent: false
    },
    children: [
      {
        path: '',
        component: ModelOverviewComponent,
        data: {
          title: 'Model / Overview'
        }
      },
      {
        path: 'members',
        component: ModelMembersComponent,
        data: {
          title: 'Model / Members'
        }
      },
      {
        path: 'entity',
        loadChildren: () => import('./entity/routing').then((m) => m.routes),
        data: {
          title: 'Model / Cube'
        }
      },
      {
        path: 'virtual-cube',
        loadChildren: () => import('./virtual-cube/virtual-cube.module').then((m) => m.VirtualCubeModule),
        data: {
          title: 'Model / Virtual Cube'
        }
      },
      {
        path: 'dimension',
        loadChildren: () => import('./dimension/dimension.module').then((m) => m.ModelDimensionModule),
        data: {
          title: 'Model / Dimension'
        }
      },
      {
        path: 'query',
        loadChildren: () => import('./query-lab/query-lab.module').then((m) => m.QueryLabModule),
        data: {
          title: 'Model / Query'
        }
      },
      {
        path: 'access',
        loadChildren: () => import('./access-control/access-control.module').then((m) => m.AccessControlModule),
        data: {
          title: 'Model / Access'
        }
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModelRoutingModule {}