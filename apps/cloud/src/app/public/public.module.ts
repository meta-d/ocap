import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatBottomSheetModule } from '@angular/material/bottom-sheet'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { AnalyticalCardModule } from '@metad/ocap-angular/analytical-card'
import { OcapCoreModule, OCAP_AGENT_TOKEN, OCAP_DATASOURCE_TOKEN } from '@metad/ocap-angular/core'
import { NGM_WASM_AGENT_WORKER, WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { DataSource, Type } from '@metad/ocap-core'
import { C_URI_API_MODELS } from '@metad/cloud/state'
import { NX_STORY_FEED, NX_STORY_STORE } from '@metad/story/core'
import { NxStoryModule } from '@metad/story/story'
import { NgxEchartsModule } from 'ngx-echarts'
import { PAC_SERVER_AGENT_DEFAULT_OPTIONS, ServerAgent, StoryPublicResolver } from '../@core'
import { StoryFeedService, StoryPublicService } from '../services'
import { STORY_WIDGET_COMPONENTS } from '../widgets'
import { CreatedByPipe } from './created-by.pipe'
import { PublicPointComponent } from './point/point.component'
import { PublicRoutingModule } from './public-routing.module'
import { PublicComponent } from './public.component'
import { StoryViewerComponent } from './story/viewer.component'
import { PublicWidgetComponent } from './widget/widget.component'
import { NgmTransformScaleDirective } from '@metad/core'
import { ContentLoaderModule } from '@ngneat/content-loader'

@NgModule({
  imports: [
    CommonModule,
    PublicRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatBottomSheetModule,
    ContentLoaderModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    NxStoryModule,
    AnalyticalCardModule,
    OcapCoreModule.forRoot(),

    NgmTransformScaleDirective

    // Story Widgets
  ],
  exports: [],
  declarations: [PublicComponent, StoryViewerComponent, PublicPointComponent, PublicWidgetComponent, CreatedByPipe],
  providers: [
    StoryPublicResolver,
    {
      provide: NX_STORY_STORE,
      useClass: StoryPublicService
    },
    {
      provide: NX_STORY_FEED,
      useClass: StoryFeedService
    },
    WasmAgentService,
    {
      provide: NGM_WASM_AGENT_WORKER,
      useValue: '/assets/ocap-agent-data-init.worker.js'
    },
    {
      provide: PAC_SERVER_AGENT_DEFAULT_OPTIONS,
      useValue: {
        modelBaseUrl: C_URI_API_MODELS + '/public'
      }
    },
    ServerAgent,
    {
      provide: OCAP_AGENT_TOKEN,
      useExisting: WasmAgentService,
      multi: true
    },
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
    ...STORY_WIDGET_COMPONENTS
  ]
})
export class PublicModule {}
