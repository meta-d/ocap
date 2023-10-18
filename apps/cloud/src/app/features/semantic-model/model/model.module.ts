import { ScrollingModule } from '@angular/cdk/scrolling'
import { NgModule } from '@angular/core'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { ContentLoaderModule } from '@ngneat/content-loader'
import { FormlyModule } from '@ngx-formly/core'
import { NxActionStripModule } from '@metad/components/action-strip'
import { NxEditorModule } from '@metad/components/editor'
import { NxTableModule } from '@metad/components/table'
import { NxComponentSettingsComponent, NxDesignerModule, STORY_DESIGNER_COMPONENT } from '@metad/story/designer'
import { MonacoEditorModule } from 'ngx-monaco-editor'
import { NgmCommonModule, ResizerModule, SplitterModule } from '@metad/ocap-angular/common'
import { CopilotChatComponent, CreatedByPipe, MaterialModule, UserPipe } from '../../../@shared'
import { ModelCreateEntityComponent } from './create-entity/create-entity.component'
import { ModelRoutingModule } from './model-routing.module'
import { ModelComponent } from './model.component'
import { ModelPreferencesComponent } from './preferences/preferences.component'
import {
  CalculatedMemberAttributesSchema,
  CalculatedMemberSchemaService,
  CubeAttributesSchema,
  CubeSchemaService,
  DimensionAttributesSchema,
  DimensionSchemaService,
  DimensionUsageSchemaService,
  HierarchyAttributesSchema,
  HierarchySchemaService,
  LevelAttributesSchema,
  LevelSchemaService,
  MeasureAttributesSchema,
  MeasureSchemaService
} from './schema/index'
import { StoryModelResolver } from './story-model.resolver'
import { ModelDesignerType } from './types'
import { ModelOverviewComponent } from './overview/overview.component'
import { ModelUploadComponent } from '../upload/upload.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NgxPopperjsModule } from 'ngx-popperjs'
import { TranslateModule } from '@ngx-translate/core'
import { CommonModule } from '@angular/common'
import { LetDirective } from '@ngrx/component'
import { CdkMenuModule } from '@angular/cdk/menu'
import { registerModelCommands } from './copilot'

registerModelCommands()

@NgModule({
  declarations: [
    ModelComponent,
    ModelOverviewComponent,
    ModelCreateEntityComponent,
    ModelPreferencesComponent,
  ],
  imports: [
    CommonModule,
    ModelRoutingModule,
    FormsModule,
    MaterialModule,
    CdkMenuModule,
    TranslateModule,
    ReactiveFormsModule,
    ScrollingModule,
    ContentLoaderModule,
    FormlyModule,
    NgxPopperjsModule,
    LetDirective,
    NxEditorModule,
    NxTableModule,
    CreatedByPipe,
    UserPipe,
    
    NxActionStripModule,
    NxDesignerModule,
    ModelUploadComponent,
    CopilotChatComponent,

    // OCAP Modules
    ResizerModule,
    SplitterModule,
    MonacoEditorModule.forRoot(),
    OcapCoreModule.forRoot(),
    NgmCommonModule,

    // Thirdparty
  ],
  providers: [
    StoryModelResolver,
    {
      provide: STORY_DESIGNER_COMPONENT,
      useValue: {
        type: ModelDesignerType.cube,
        component: NxComponentSettingsComponent,
        schema: CubeSchemaService
      },
      multi: true
    },
    {
      provide: STORY_DESIGNER_COMPONENT,
      useValue: {
        type: ModelDesignerType.dimension,
        component: NxComponentSettingsComponent,
        schema: DimensionSchemaService
      },
      multi: true
    },
    {
      provide: STORY_DESIGNER_COMPONENT,
      useValue: {
        type: ModelDesignerType.dimensionUsage,
        component: NxComponentSettingsComponent,
        schema: DimensionUsageSchemaService
      },
      multi: true
    },
    {
      provide: STORY_DESIGNER_COMPONENT,
      useValue: {
        type: ModelDesignerType.hierarchy,
        component: NxComponentSettingsComponent,
        schema: HierarchySchemaService
      },
      multi: true
    },
    {
      provide: STORY_DESIGNER_COMPONENT,
      useValue: {
        type: ModelDesignerType.level,
        component: NxComponentSettingsComponent,
        schema: LevelSchemaService
      },
      multi: true
    },
    {
      provide: STORY_DESIGNER_COMPONENT,
      useValue: {
        type: ModelDesignerType.measure,
        component: NxComponentSettingsComponent,
        schema: MeasureSchemaService
      },
      multi: true
    },
    {
      provide: STORY_DESIGNER_COMPONENT,
      useValue: {
        type: ModelDesignerType.calculatedMember,
        component: NxComponentSettingsComponent,
        schema: CalculatedMemberSchemaService
      },
      multi: true
    },
    {
      provide: STORY_DESIGNER_COMPONENT,
      useValue: {
        type: ModelDesignerType.cubeAttributes,
        component: NxComponentSettingsComponent,
        schema: CubeAttributesSchema
      },
      multi: true
    },
    {
      provide: STORY_DESIGNER_COMPONENT,
      useValue: {
        type: ModelDesignerType.dimensionAttributes,
        component: NxComponentSettingsComponent,
        schema: DimensionAttributesSchema
      },
      multi: true
    },
    {
      provide: STORY_DESIGNER_COMPONENT,
      useValue: {
        type: ModelDesignerType.hierarchyAttributes,
        component: NxComponentSettingsComponent,
        schema: HierarchyAttributesSchema
      },
      multi: true
    },
    {
      provide: STORY_DESIGNER_COMPONENT,
      useValue: {
        type: ModelDesignerType.levelAttributes,
        component: NxComponentSettingsComponent,
        schema: LevelAttributesSchema
      },
      multi: true
    },
    {
      provide: STORY_DESIGNER_COMPONENT,
      useValue: {
        type: ModelDesignerType.measureAttributes,
        component: NxComponentSettingsComponent,
        schema: MeasureAttributesSchema
      },
      multi: true
    },
    {
      provide: STORY_DESIGNER_COMPONENT,
      useValue: {
        type: ModelDesignerType.calculatedMemberAttributes,
        component: NxComponentSettingsComponent,
        schema: CalculatedMemberAttributesSchema
      },
      multi: true
    }
  ]
})
export class ModelModule {}
