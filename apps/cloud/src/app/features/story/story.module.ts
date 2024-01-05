import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NgmDialogComponent } from '@metad/components/dialog'
import { NgmFormlyModule } from '@metad/formly'
import { NgmCommonModule, NgmTableComponent, TreeTableModule } from '@metad/ocap-angular/common'
import { NgmStoryModule, provideStorySettings } from '@metad/story'
import { NgmFormlyChartPropertModule } from '@metad/story/widgets/analytical-card'
import { TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular'
import { NgxEchartsModule } from 'ngx-echarts'
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger'
import { MonacoEditorModule } from 'ngx-monaco-editor'
import { StoryResolver } from '../../@core/services'
import { STORY_WIDGET_COMPONENTS } from '../../widgets'
import { PACFormlyImageUploadComponent, PACFormlyWidgetDesignerComponent } from './designer'
import { StoryRoutingModule } from './story-routing.module'
import { STORY_DESIGNER_COMPONENTS } from './widgets'


@NgModule({
  declarations: [],
  imports: [
    RouterModule,
    StoryRoutingModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    MonacoEditorModule.forRoot(),
    LoggerModule.forRoot({
      level: NgxLoggerLevel.DEBUG,
      serverLogLevel: NgxLoggerLevel.ERROR
    }),

    // Formly
    NgmFormlyModule.forRoot({
      types: [
        {
          name: 'styling',
          component: PACFormlyWidgetDesignerComponent
        },
        {
          name: 'image-upload',
          component: PACFormlyImageUploadComponent
        }
      ]
    }),
    NgmFormlyChartPropertModule,

    NgmCommonModule,
    NgmDialogComponent,
    NgmTableComponent,
    TreeTableModule,
    NgmStoryModule
  ],
  exports: [],
  providers: [
    StoryResolver,
    {
      provide: TINYMCE_SCRIPT_SRC,
      useValue: '../assets/tinymce/tinymce.min.js'
    },
    ...STORY_WIDGET_COMPONENTS,
    ...STORY_DESIGNER_COMPONENTS,
    provideStorySettings(),
  ]
})
export class PACStoryModule {}
