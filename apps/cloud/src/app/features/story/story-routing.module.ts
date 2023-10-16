import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { DirtyCheckGuard, StoryResolver } from '../../@core/index'
import { StoryComponent } from './story/story.component'
import { StoryViewerComponent } from './viewer/viewer.component'
import { StoryWidgetComponent } from './widget/widget.component'
import { StoryPointComponent } from './point/point.component'

const routes: Routes = [
  {
    path: 'point/:id',
    component: StoryPointComponent
  },
  {
    path: 'widget/:id',
    component: StoryWidgetComponent
  },
  {
    path: ':id',
    component: StoryViewerComponent,
    data: { title: 'pac.menu.story' },
    resolve: { story: StoryResolver }
  },
  {
    path: ':id/edit',
    component: StoryComponent,
    canDeactivate: [DirtyCheckGuard],
    data: { title: 'pac.menu.story' },
    resolve: { story: StoryResolver }
  }
]

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoryRoutingModule {}
