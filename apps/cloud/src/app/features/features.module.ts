import { CommonModule } from '@angular/common'
import { NgModule, importProvidersFrom } from '@angular/core'
import { PacAuthModule } from '@metad/cloud/auth'
import { NgmFormlyModule, provideFormly, provideFormlyMaterial } from '@metad/formly'
import { registerEChartsThemes } from '@metad/material-theme'
import { NgmDrawerTriggerComponent, NgmTableComponent, ResizerModule } from '@metad/ocap-angular/common'
import { NgmCopilotContextService, NgmCopilotChatComponent, NgmCopilotContextToken, NgmCopilotEngineService, NgmCopilotService } from '@metad/ocap-angular/copilot'
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
import { provideMarkdown } from 'ngx-markdown'
import { NgxPopperjsModule } from 'ngx-popperjs'
import { environment } from '../../environments/environment'
import { DirtyCheckGuard, LocalAgent, PACCopilotService, ServerAgent, ServerSocketAgent, provideLogger } from '../@core/index'
import { AssetsComponent } from '../@shared/assets/assets.component'
import { MaterialModule, SharedModule } from '../@shared/index'
import { NotificationComponent, TuneComponent } from '../@theme'
import { HeaderSettingsComponent, ProjectSelectorComponent } from '../@theme/header'
import { PACThemeModule } from '../@theme/theme.module'
import { StoryFeedService, StoryModelService, StoryStoreService } from '../services/index'
import { FeaturesRoutingModule } from './features-routing.module'
import { FeaturesComponent } from './features.component'
import { provideDimensionMemberRetriever } from '../@core/copilot'

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
    NgmTableComponent,
    NotificationComponent,
    TuneComponent,
  ],
  providers: [
    DirtyCheckGuard,
    NgmAgentService,
    NgmDSCacheService,
    provideLogger(),
    provideFormly(),
    provideFormlyMaterial(),
    provideMarkdown({}),
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
    ServerSocketAgent,
    {
      provide: OCAP_AGENT_TOKEN,
      useExisting: ServerSocketAgent,
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
      provide: NgmCopilotService,
      useExisting: PACCopilotService
    },
    NgmCopilotEngineService,
    {
      provide: NgmCopilotContextToken,
      useClass: NgmCopilotContextService
    },
    provideDimensionMemberRetriever()
  ]
})
export class FeaturesModule {}
