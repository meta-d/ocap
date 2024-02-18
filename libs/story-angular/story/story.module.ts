import { CdkMenuModule } from '@angular/cdk/menu'
import { OverlayModule } from '@angular/cdk/overlay'
import { NgModule } from '@angular/core'
import { HammerModule } from '@angular/platform-browser'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { ContentLoaderModule } from '@ngneat/content-loader'
import { TranslateModule } from '@ngx-translate/core'
import { ConfirmModule } from '@metad/components/confirm'
import { TrialWatermarkModule } from '@metad/components/trial-watermark'
import { IsNilPipe, NgMapPipeModule, NxCoreModule } from '@metad/core'
import { NxStoryResponsiveModule } from '@metad/story/responsive'
import { GridsterModule } from 'angular-gridster2'
import { NgxPopperjsModule } from 'ngx-popperjs'
import { QuillModule } from 'ngx-quill'
import { NxStorySharedModule } from './shared.module'
import { StorySharesComponent } from './shares/shares.component'
import { StoryCommentsComponent } from './story-comments/story-comments.component'
import { NxStoryPointComponent } from './story-point/story-point.component'
import { NxStoryWidgetComponent } from './story-widget/story-widget.component'
import { NxStoryComponent } from './story/story.component'


@NgModule({
  declarations: [],
  imports: [
    NxStorySharedModule,
    OverlayModule,
    CdkMenuModule,
    GridsterModule,
    QuillModule,
    HammerModule,
    ConfirmModule,
    TranslateModule,
    TrialWatermarkModule,
    IsNilPipe,
    NgMapPipeModule,
    ContentLoaderModule,
    NgxPopperjsModule,
    NxStoryResponsiveModule,
    NxCoreModule,

    // OCAP Modules
    OcapCoreModule,
    NgmCommonModule,

    // Local modules
    StorySharesComponent,
    NxStoryComponent,
    NxStoryPointComponent,
    NxStoryWidgetComponent,
    StoryCommentsComponent,
  ],
  exports: [NxStoryComponent, NxStoryWidgetComponent, NxStoryPointComponent]
})
export class NxStoryModule {}
