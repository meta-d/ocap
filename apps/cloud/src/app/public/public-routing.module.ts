import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { StoryPublicResolver } from '../@core'
import { PublicPointComponent } from './point/point.component'
import { PublicComponent } from './public.component'
import { StoryViewerComponent } from './story/viewer.component'
import { TrendingComponent } from './trending/trending.componnet'
import { PublicWidgetComponent } from './widget/widget.component'

const routes: Routes = [
  {
    path: '',
    component: PublicComponent
  },
  {
    path: 'trending',
    component: TrendingComponent
  },
  {
    path: 'story/point/:id',
    component: PublicPointComponent
  },
  {
    path: 'story/widget/:id',
    component: PublicWidgetComponent
  },
  {
    path: 'story/:id',
    component: StoryViewerComponent,
    resolve: { story: StoryPublicResolver }
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule {}
