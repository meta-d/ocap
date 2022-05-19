import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { FlexLayoutModule } from '@angular/flex-layout'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { OcapCoreModule, OCAP_AGENT_TOKEN, OCAP_DATASOURCE_TOKEN, OCAP_MODEL_TOKEN } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { AgentType, DataSource, Type } from '@metad/ocap-core'
import { DUCKDB_WASM_MODEL } from '@metad/ocap-duckdb'
import { DEFAULT_THEME } from '@metad/ocap-echarts'
import { MissingTranslationHandler, MissingTranslationHandlerParams, TranslateModule } from '@ngx-translate/core'
import { registerTheme } from 'echarts/core'
import { NgxEchartsModule } from 'ngx-echarts'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { MockAgent } from './mock'
import { NxWelcomeComponent } from './nx-welcome.component'

registerTheme(DEFAULT_THEME.name, DEFAULT_THEME.echartsTheme)

export class MyMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    if (params.interpolateParams) {
      return params.interpolateParams['Default'] || params.key
    }
    return params.key
  }
}

@NgModule({
  declarations: [AppComponent, NxWelcomeComponent],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule.forRoot({
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MyMissingTranslationHandler
      }
    }),
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    OcapCoreModule.forRoot()
  ],
  providers: [
    WasmAgentService,
    {
      provide: OCAP_AGENT_TOKEN,
      useExisting: WasmAgentService,
      multi: true
    },
    {
      provide: OCAP_AGENT_TOKEN,
      useClass: MockAgent,
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
      provide: OCAP_MODEL_TOKEN,
      useValue: {
        name: 'Sales',
        type: 'SQL',
        agentType: AgentType.Browser
      },
      multi: true
    },
    {
      provide: OCAP_MODEL_TOKEN,
      useValue: DUCKDB_WASM_MODEL,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
