import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { OcapCoreModule, provideOcapCore } from '@metad/ocap-angular/core'
import { EmbedWidgetComponent, NxStoryModule } from '@metad/story/story'
import { IntersectionObserverModule } from '@ng-web-apis/intersection-observer'
import { TranslateModule } from '@ngx-translate/core'
import { GridsterModule } from 'angular-gridster2'
import { NgxEchartsModule } from 'ngx-echarts'
import { MaterialModule, SharedModule } from '../../@shared'
import { STORY_WIDGET_COMPONENTS } from '../../widgets'
import { DashboardComponent } from './dashboard/dashboard.component'
import { HomeRoutingModule } from './home-routing.module'
import { InsightService } from './insight/insight.service'
import { RecentsComponent } from './recents/recents.component'
import { StoryWidgetFeedComponent } from './story-widget/story-widget.component'
import { UserVisitComponent } from './user-visit/user-visit.component'

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

    OcapCoreModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    NxStoryModule
  ],
  exports: [],
  declarations: [DashboardComponent, StoryWidgetFeedComponent, RecentsComponent, UserVisitComponent],
  providers: [provideOcapCore(), InsightService, ...STORY_WIDGET_COMPONENTS]
})
export class HomeModule {}
