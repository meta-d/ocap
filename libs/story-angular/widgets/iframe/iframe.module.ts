import { CommonModule } from '@angular/common'
import { ModuleWithProviders, NgModule } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { NxCoreModule } from '@metad/core'
import { PlaceholderAddComponent } from '@metad/story/story'
import { NxWidgetIframeComponent } from './iframe.component'

@NgModule({
  declarations: [NxWidgetIframeComponent],
  imports: [CommonModule, TranslateModule, NxCoreModule, PlaceholderAddComponent],
  exports: [NxWidgetIframeComponent]
})
export class NxWidgetIFrameModule {
  static forRoot(): ModuleWithProviders<NxWidgetIFrameModule> {
    return {
      ngModule: NxWidgetIFrameModule,
      providers: [
        // {
        //   provide: STORY_WIDGET_COMPONENT,
        //   useValue: {
        //     type: WidgetComponentType.Iframe,
        //     component: NxWidgetIframeComponent,
        //     mapping: ['title', 'options'],
        //     icon: 'filter_frames',
        //     label: 'IFrame'
        //   },
        //   multi: true
        // },
        // {
        //   provide: STORY_DESIGNER_COMPONENT,
        //   useValue: {
        //     type: WidgetComponentType.Iframe,
        //     component: NxComponentSettingsComponent,
        //     schema: IFrameSchemaService
        //   },
        //   multi: true
        // }
      ]
    }
  }
}
