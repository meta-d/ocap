import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { EmbedWidgetComponent, NxStoryModule } from '@metad/story/story'
import { GridsterModule } from 'angular-gridster2'
import { NgxEchartsModule } from 'ngx-echarts'
import { IntersectionObserverModule } from '@ng-web-apis/intersection-observer'
import { MaterialModule, SharedModule } from '../../@shared'
import { STORY_WIDGET_COMPONENTS } from '../../widgets'

import { DashboardComponent } from './dashboard/dashboard.component'
import { HomeRoutingModule } from './home-routing.module'
import { RecentsComponent } from './recents/recents.component'
import { StoryWidgetFeedComponent } from './story-widget/story-widget.component'
import { UserVisitComponent } from './user-visit/user-visit.component'
import { InsightService } from './insight/insight.service'

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    TranslateModule,
    HomeRoutingModule,
    GridsterModule,
    IntersectionObserverModule,

    EmbedWidgetComponent,

    OcapCoreModule.forRoot(),
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    NxStoryModule
  ],
  exports: [],
  declarations: [DashboardComponent, StoryWidgetFeedComponent, RecentsComponent, UserVisitComponent],
  providers: [
    InsightService,
    ...STORY_WIDGET_COMPONENTS]
})
export class HomeModule {}
