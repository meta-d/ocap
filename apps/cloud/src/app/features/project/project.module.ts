import { A11yModule } from '@angular/cdk/a11y'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NgmDialogComponent } from '@metad/components/dialog'
import { NxTableModule } from '@metad/components/table'
import { NgmCommonModule, NgmTreeSelectComponent, ResizerModule, TreeTableModule } from '@metad/ocap-angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
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

    // // Formly
    // FormlyModule.forRoot(),
    // FormlyMaterialModule,
    // FormlyMatToggleModule,
    // FormlyMatSliderModule,
    // MetadFormlyMatModule,
    // PACFormlyChartTypeModule,
    // PACFormlyMatSlicersModule,
    // PACFormlyPropertySelectModule,
    // PACFormlyCodeEditorModule,
    // PACFormlyDesignerModule,
    // PACFormlyEmptyModule,
    // PACFormlyButtonToggleModule,
    // PACFormlyTableModule,
    // MetadFormlyAccordionModule,

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
