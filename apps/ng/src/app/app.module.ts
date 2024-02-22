import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { NgModule, importProvidersFrom } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatIconModule } from '@angular/material/icon'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatTabsModule } from '@angular/material/tabs'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { AnalyticalCardModule } from '@metad/ocap-angular/analytical-card'
import { AnalyticalGridModule } from '@metad/ocap-angular/analytical-grid'
import { NgmCommonModule, NgmTreeSelectComponent } from '@metad/ocap-angular/common'
import { NgmControlsModule } from '@metad/ocap-angular/controls'
import { NgmCopilotChatComponent, provideClientCopilot } from '@metad/ocap-angular/copilot'
import {
  NgmMissingTranslationHandler,
  OCAP_AGENT_TOKEN,
  OCAP_DATASOURCE_TOKEN,
  OCAP_MODEL_TOKEN,
  OcapCoreModule
} from '@metad/ocap-angular/core'
import { NgmFormulaModule } from '@metad/ocap-angular/formula'
import { ZhHans } from '@metad/ocap-angular/i18n'
import { SlicersModule } from '@metad/ocap-angular/slicers'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { AgentType, DataSource, Type } from '@metad/ocap-core'
import {
  DUCKDB_COVID19_DAILY_MODEL,
  DUCKDB_FOODMART_MODEL,
  DUCKDB_TOP_SUBSCRIBED_MODEL,
  DUCKDB_UNEMPLOYMENT_MODEL,
  DUCKDB_WASM_MODEL
} from '@metad/ocap-duckdb'
import { DEFAULT_THEME } from '@metad/ocap-echarts'
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { registerTheme } from 'echarts/core'
import { NgxEchartsModule } from 'ngx-echarts'
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger'
import { provideMarkdown } from 'ngx-markdown'
import { MonacoEditorModule } from 'ngx-monaco-editor'
import { Observable, of } from 'rxjs'
import { environment } from '../environments/environment'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { ChartsComponent } from './charts/charts.component'
import { FoodMartComponent } from './foodmart/foodmart.component'
import { MockAgent } from './mock'
import { NxWelcomeComponent } from './nx-welcome.component'

registerTheme(DEFAULT_THEME.name, DEFAULT_THEME.echartsTheme)

export class CustomLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of(ZhHans)
  }
}

@NgModule({
  declarations: [AppComponent, ChartsComponent, FoodMartComponent, NxWelcomeComponent],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,

    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatTabsModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatSlideToggleModule,

    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: { provide: TranslateLoader, useClass: CustomLoader },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: NgmMissingTranslationHandler
      }
    }),
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    MonacoEditorModule.forRoot(),
    OcapCoreModule.forRoot(),
    NgmControlsModule,
    AnalyticalCardModule,
    AnalyticalGridModule,
    NgmCommonModule,
    NgmTreeSelectComponent,
    NgmFormulaModule,
    SlicersModule,

    NgmCopilotChatComponent
  ],
  providers: [
    provideClientCopilot(() => Promise.resolve(environment.copilot)),
    importProvidersFrom(
      LoggerModule.forRoot({
        // serverLoggingUrl: '/api/logs',
        level: NgxLoggerLevel.DEBUG,
        serverLogLevel: NgxLoggerLevel.ERROR
      })
    ),
    provideMarkdown(),
    {
      provide: WasmAgentService,
      useFactory: () => {
        return new WasmAgentService('/assets/ocap-agent-data-init.worker.js')
      }
    },
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
    // {
    //   provide: OCAP_DATASOURCE_TOKEN,
    //   useValue: {
    //     type: 'OData',
    //     factory: async (): Promise<Type<DataSource>> => {
    //       const { ODataDataSource } = await import('@metad/ocap-odata')
    //       return ODataDataSource
    //     }
    //   },
    //   multi: true
    // },
    {
      provide: OCAP_MODEL_TOKEN,
      useValue: {
        name: 'Sales',
        type: 'SQL',
        agentType: AgentType.Browser,
        settings: {
          ignoreUnknownProperty: true
        },
        schema: {
          cubes: [
            {
              name: 'SalesOrder',
              tables: [{ name: 'SalesOrder' }],
              dimensions: [
                {
                  name: 'productCategory',
                  hierarchies: [
                    {
                      name: '',
                      levels: [
                        {
                          name: 'productCategory',
                          column: 'productCategory'
                        }
                      ]
                    }
                  ]
                },
                {
                  name: 'product',
                  caption: 'productName',
                  hierarchies: [
                    {
                      name: '',
                      levels: [
                        {
                          name: 'productCategory',
                          column: 'productCategory'
                        }
                      ]
                    }
                  ]
                },
                {
                  name: 'Department',
                  caption: 'DepartmentName'
                }
              ],
              measures: [
                {
                  name: 'sales',
                  column: 'sales'
                }
              ]
            }
          ]
        }
      },
      multi: true
    },
    {
      provide: OCAP_MODEL_TOKEN,
      useValue: {
        ...DUCKDB_WASM_MODEL,
        settings: {
          ignoreUnknownProperty: true
        }
      },
      multi: true
    },
    {
      provide: OCAP_MODEL_TOKEN,
      useValue: {
        ...DUCKDB_FOODMART_MODEL,
        settings: {
          ignoreUnknownProperty: true
        }
      },
      multi: true
    },
    {
      provide: OCAP_MODEL_TOKEN,
      useValue: {
        ...DUCKDB_UNEMPLOYMENT_MODEL,
        settings: {
          ignoreUnknownProperty: true
        }
      },
      multi: true
    },
    {
      provide: OCAP_MODEL_TOKEN,
      useValue: {
        ...DUCKDB_COVID19_DAILY_MODEL,
        settings: {
          ignoreUnknownProperty: true
        }
      },
      multi: true
    },
    {
      provide: OCAP_MODEL_TOKEN,
      useValue: {
        ...DUCKDB_TOP_SUBSCRIBED_MODEL,
        settings: {
          ignoreUnknownProperty: true
        }
      },
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
