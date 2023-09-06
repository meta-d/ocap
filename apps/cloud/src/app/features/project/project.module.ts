import { A11yModule } from '@angular/cdk/a11y'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { MetadFormlyMatModule } from '@metad/formly-mat'
import { MetadFormlyAccordionModule } from '@metad/formly-mat/accordion'
import { NgmCommonModule, NgmTreeSelectComponent, ResizerModule, TreeTableModule } from '@metad/ocap-angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { FormlyModule } from '@ngx-formly/core'
import { FormlyMaterialModule } from '@ngx-formly/material'
import { FormlyMatSliderModule } from '@ngx-formly/material/slider'
import { FormlyMatToggleModule } from '@ngx-formly/material/toggle'
import { NgmDialogComponent } from '@metad/components/dialog'
import { NxTableModule } from '@metad/components/table'
import { PACFormlyButtonToggleModule } from '@metad/formly/button-toggle'
import { PACFormlyChartTypeModule } from '@metad/formly/chart-type'
import { PACFormlyCodeEditorModule } from '@metad/formly/code-editor'
import { PACFormlyDesignerModule } from '@metad/formly/designer'
import { PACFormlyEmptyModule } from '@metad/formly/empty'
import { PACFormlyTableModule } from '@metad/formly/mat-table'
import { PACFormlyPropertySelectModule } from '@metad/formly/property-select'
import { PACFormlyMatSlicersModule } from '@metad/formly/slicers'
import { NxStorySettingsModule } from '@metad/story'
import { TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular'
import { NgxEchartsModule } from 'ngx-echarts'
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger'
import { MonacoEditorModule } from 'ngx-monaco-editor'
import { StoryResolver } from '../../@core/services'
import { STORY_WIDGET_COMPONENTS } from '../../widgets'
import { STORY_DESIGNER_COMPONENTS } from '../story/widgets'
import { ProjectRoutingModule } from './project-routing.module'

@NgModule({
  declarations: [],
  imports: [
    A11yModule,
    RouterModule,
    ProjectRoutingModule,
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
    FormlyModule.forRoot(),
    FormlyMaterialModule,
    FormlyMatToggleModule,
    FormlyMatSliderModule,
    MetadFormlyMatModule,
    PACFormlyChartTypeModule,
    PACFormlyMatSlicersModule,
    PACFormlyPropertySelectModule,
    PACFormlyCodeEditorModule,
    PACFormlyDesignerModule,
    PACFormlyEmptyModule,
    PACFormlyButtonToggleModule,
    PACFormlyTableModule,
    MetadFormlyAccordionModule,

    OcapCoreModule.forRoot(),
    NgmCommonModule,
    NgmDialogComponent,
    NxTableModule,
    ResizerModule,

    TreeTableModule,
    NgmTreeSelectComponent
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
export class ProjectModule {}
