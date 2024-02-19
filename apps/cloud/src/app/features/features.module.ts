import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { PacAuthModule } from '@metad/cloud/auth'
import { CopilotService } from '@metad/copilot'
import { NgmFormlyModule, provideFormly } from '@metad/formly'
import { NgmDrawerTriggerComponent, NgmTableComponent, ResizerModule } from '@metad/ocap-angular/common'
import { NgmCopilotChatComponent, NgmCopilotEngineService } from '@metad/ocap-angular/copilot'
import {
  DensityDirective,
  NgmAgentService,
  NgmDSCacheService,
  OCAP_AGENT_TOKEN,
  OCAP_DATASOURCE_TOKEN
} from '@metad/ocap-angular/core'
import { NGM_WASM_AGENT_WORKER, WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { DataSource, Type } from '@metad/ocap-core'
import { NX_STORY_FEED, NX_STORY_MODEL, NX_STORY_STORE } from '@metad/story/core'
import { registerEChartsThemes } from '@metad/material-theme'
import { NgxPopperjsModule } from 'ngx-popperjs'
import { environment } from '../../environments/environment'
import { DirtyCheckGuard, LocalAgent, PACCopilotService, ServerAgent } from '../@core/index'
import { AssetsComponent } from '../@shared/assets/assets.component'
import { MaterialModule, PACStatusBarComponent, SharedModule } from '../@shared/index'
import { HeaderSettingsComponent, ProjectSelectorComponent } from '../@theme/header'
import { PACThemeModule } from '../@theme/theme.module'
import { StoryFeedService, StoryModelService, StoryStoreService } from '../services/index'
import { FeaturesRoutingModule } from './features-routing.module'
import { FeaturesComponent } from './features.component'

registerEChartsThemes()

@NgModule({
  declarations: [FeaturesComponent],
  imports: [
    CommonModule,
    FeaturesRoutingModule,
    MaterialModule,
    SharedModule,
    PacAuthModule,
    PACThemeModule,
    PACStatusBarComponent,
    NgxPopperjsModule,
    HeaderSettingsComponent,
    AssetsComponent,
    ProjectSelectorComponent,
    DensityDirective,

    // Formly
    NgmFormlyModule,

    NgmCopilotChatComponent,
    NgmDrawerTriggerComponent,
    ResizerModule,
    NgmTableComponent
  ],
  providers: [
    DirtyCheckGuard,
    NgmAgentService,
    NgmDSCacheService,
    provideFormly(),
    {
      provide: NGM_WASM_AGENT_WORKER,
      useValue: '/assets/ocap-agent-data-init.worker.js'
    },
    WasmAgentService,
    {
      provide: OCAP_AGENT_TOKEN,
      useExisting: WasmAgentService,
      multi: true
    },
    ...(environment.enableLocalAgent
      ? [
          LocalAgent,
          {
            provide: OCAP_AGENT_TOKEN,
            useExisting: LocalAgent,
            multi: true
          }
        ]
      : []),
    ServerAgent,
    {
      provide: OCAP_AGENT_TOKEN,
      useExisting: ServerAgent,
      multi: true
    },
    {
      provide: OCAP_DATASOURCE_TOKEN,
      useValue: {
        type: 'SQL',
        factory: async (): Promise<Type<DataSource>> => {
          const { SQLDataSource } = await import('@metad/ocap-sql')
          return SQLDataSource
        }
      },
      multi: true
    },
    {
      provide: OCAP_DATASOURCE_TOKEN,
      useValue: {
        type: 'XMLA',
        factory: async (): Promise<Type<DataSource>> => {
          const { XmlaDataSource } = await import('@metad/ocap-xmla')
          return XmlaDataSource
        }
      },
      multi: true
    },
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
    },
    {
      provide: CopilotService,
      useExisting: PACCopilotService
    },
    NgmCopilotEngineService
  ]
})
export class FeaturesModule {}
