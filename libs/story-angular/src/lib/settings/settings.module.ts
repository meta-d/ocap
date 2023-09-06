import { ModuleWithProviders, NgModule } from '@angular/core'
import { ButtonGroupDirective } from '@metad/ocap-angular/core'
import { FormlyModule } from '@ngx-formly/core'
import { TranslateModule } from '@ngx-translate/core'
import { ComponentSettingsType } from '@metad/story/core'
import { NxComponentSettingsComponent, STORY_DESIGNER_COMPONENT } from '@metad/story/designer'
import { StoryFilterBarSchemaService } from '@metad/story/widgets/filter-bar'
import { QuillModule } from 'ngx-quill'
import { PreferencesComponent } from './preferences/preferences.component'
import {
  FlexLayoutSchemaService,
  LinkedAnalysisSchemaService,
  StoryPointBuilderSchema,
} from './schemas/index'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatDialogModule } from '@angular/material/dialog'


@NgModule({
  declarations: [PreferencesComponent],
  imports: [
    MatIconModule,
    MatListModule,
    MatDialogModule,
    FormlyModule, QuillModule, TranslateModule, ButtonGroupDirective],
  exports: [PreferencesComponent]
})
export class NxStorySettingsModule {
  static forRoot(): ModuleWithProviders<NxStorySettingsModule> {
    return {
      ngModule: NxStorySettingsModule,
      providers: [
        {
          provide: STORY_DESIGNER_COMPONENT,
          useValue: {
            type: ComponentSettingsType.StoryPoint,
            component: NxComponentSettingsComponent,
            schema: StoryPointBuilderSchema,
            icon: 'handyman'
          },
          multi: true
        },
        {
          provide: STORY_DESIGNER_COMPONENT,
          useValue: {
            type: ComponentSettingsType.LinkedAnalysis,
            component: NxComponentSettingsComponent,
            schema: LinkedAnalysisSchemaService
          },
          multi: true
        },
        {
          provide: STORY_DESIGNER_COMPONENT,
          useValue: {
            type: ComponentSettingsType.FlexLayout,
            component: NxComponentSettingsComponent,
            schema: FlexLayoutSchemaService
          },
          multi: true
        },
        {
          provide: STORY_DESIGNER_COMPONENT,
          useValue: {
            type: ComponentSettingsType.StoryFilterBar,
            component: NxComponentSettingsComponent,
            schema: StoryFilterBarSchemaService
          },
          multi: true
        }
      ]
    }
  }
}
