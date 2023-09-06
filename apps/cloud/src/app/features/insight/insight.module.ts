import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { NgmDialogComponent } from '@metad/components/dialog'
import { NxTableModule } from '@metad/components/table'
import { NX_STORY_FEED, NX_STORY_MODEL, NX_STORY_STORE } from '@metad/story/core'
import { MaterialModule, SharedModule } from '../../@shared'
import { StoryFeedService, StoryModelService, StoryStoreService } from '../../services/index'
import { PACInsgihtBoardComponent } from './board/board.component'
import { InsightCreationComponent } from './creation/creation.component'
import { PACInsightRoutingModule } from './insight-routing.module'
import { PACInsightWidgetComponent } from './widget/widget.component'

@NgModule({
  declarations: [
    PACInsgihtBoardComponent,
    PACInsightWidgetComponent,
    InsightCreationComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    PACInsightRoutingModule,
    NgmDialogComponent,
    NxTableModule,

    OcapCoreModule.forRoot(),

  ],
  exports: [PACInsgihtBoardComponent],
  providers: [
    {
      provide: NX_STORY_STORE,
      useClass: StoryStoreService
    },
    {
      provide: NX_STORY_MODEL,
      useClass: StoryModelService
    },
    {
      provide: NX_STORY_FEED,
      useClass: StoryFeedService
    }
  ]
})
export class PACInsightModule {}
