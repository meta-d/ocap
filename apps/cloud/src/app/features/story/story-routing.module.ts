import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { DirtyCheckGuard, storyPointResolver, storyResolver } from '../../@core/index'
import { StoryPointComponent } from './point/point.component'
import { StoryDesignerComponent } from './story/story.component'
import { StoryViewerComponent } from './viewer/viewer.component'
import { StoryWidgetComponent } from './widget/widget.component'

const routes: Routes = [
  {
    path: 'point/:id',
    component: StoryPointComponent,
    resolve: { storyPoint: storyPointResolver }
  },
  {
    path: 'widget/:id',
    component: StoryWidgetComponent
  },
  {
    path: ':id',
    component: StoryViewerComponent,
    data: { title: 'pac.menu.story' },
    resolve: { story: storyResolver }
  },
  {
    path: ':id/edit',
    component: StoryDesignerComponent,
    canDeactivate: [DirtyCheckGuard],
    data: { title: 'pac.menu.story' },
    resolve: { story: storyResolver }
  }
]

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoryRoutingModule {}
