import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { MetadFormlyMatModule } from '@metad/formly-mat'
import { MetadFormlyAccordionModule } from '@metad/formly-mat/accordion'
import { NgmCommonModule, TreeTableModule } from '@metad/ocap-angular/common'
import { FormlyModule } from '@ngx-formly/core'
import { NgmDialogComponent } from '@metad/components/dialog'
import { NxTableModule } from '@metad/components/table'
import { PACFormlyButtonToggleModule } from '@metad/formly/button-toggle'
import { PACFormlyChartTypeModule } from '@metad/formly/chart-type'
import { FormlyMatCheckboxModule } from '@metad/formly/checkbox'
import { PACFormlyCodeEditorModule } from '@metad/formly/code-editor'
import { PACFormlyColorPickerModule } from '@metad/formly/color-picker'
import { PacFormlyColorsComponent } from '@metad/formly/colors'
import { PACFormlyDesignerModule } from '@metad/formly/designer'
import { PACFormlyEmptyModule } from '@metad/formly/empty'
import { PACFormlyEntityTypeModule } from '@metad/formly/entity-type'
import { PACFormlyInputModule } from '@metad/formly/input'
import { PACFormlyJsonModule } from '@metad/formly/json'
import { PACFormlyTableModule } from '@metad/formly/mat-table'
import { FormlyMatToggleModule } from '@metad/formly/mat-toggle'
import { PACFormlyPropertySelectModule } from '@metad/formly/property-select'
import { PACFormlySelectModule } from '@metad/formly/select'
import { PACFormlySemanticModelModule } from '@metad/formly/semantic-model'
import { PACFormlyMatSlicersModule } from '@metad/formly/slicers'
import { FormlyMatSliderModule } from '@metad/formly/slider'
import { PACFormlySortModule } from '@metad/formly/sort'
import { PACFormlyTextAreaModule } from '@metad/formly/textarea'
import { NxStorySettingsModule } from '@metad/story'
import { TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular'
import { NgxEchartsModule } from 'ngx-echarts'
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger'
import { MonacoEditorModule } from 'ngx-monaco-editor'
import { StoryResolver } from '../../@core/services'
import { STORY_WIDGET_COMPONENTS } from '../../widgets'
import { PACFormlyImageUploadComponent, PACFormlyWidgetDesignerComponent } from './designer'
import { StoryRoutingModule } from './story-routing.module'
import { STORY_DESIGNER_COMPONENTS } from './widgets'
import { NgmFormlyModule } from '@metad/formly'

@NgModule({
  declarations: [],
  imports: [
    RouterModule,
    StoryRoutingModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    MonacoEditorModule.forRoot(),
    NxStorySettingsModule.forRoot(),
    LoggerModule.forRoot({
      level: NgxLoggerLevel.WARN,
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
        },
      ]
    }),

    // MetadFormlyMatModule,
    // PACFormlyDesignerModule,
    // PACFormlyEmptyModule,
    // PACFormlyButtonToggleModule,
    // PACFormlyTableModule,
    // MetadFormlyAccordionModule,
    // PACFormlyInputModule,
    // PACFormlySelectModule,
    // FormlyMatCheckboxModule,
    // PACFormlyTextAreaModule,
    // PACFormlySemanticModelModule,
    // PACFormlySortModule,
    // PACFormlyColorPickerModule,
    // PACFormlyEntityTypeModule,

    NgmCommonModule,
    NgmDialogComponent,
    NxTableModule,

    TreeTableModule
  ],
  exports: [],
  providers: [
    StoryResolver,
    {
      provide: TINYMCE_SCRIPT_SRC,
      useValue: '../assets/tinymce/tinymce.min.js'
    },
    ...STORY_WIDGET_COMPONENTS,
    ...STORY_DESIGNER_COMPONENTS
  ]
})
export class PACStoryModule {}
