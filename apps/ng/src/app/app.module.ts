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
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { AgentType, MockAgent } from '@metad/ocap-core'
import { DuckdbWasmAgent } from '@metad/ocap-duckdb'
import { DEFAULT_THEME } from '@metad/ocap-echarts'
import * as SQL from '@metad/ocap-sql'
import { registerTheme } from 'echarts/core'
import { NgxEchartsModule } from 'ngx-echarts'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { NxWelcomeComponent } from './nx-welcome.component'

registerTheme(DEFAULT_THEME.name, DEFAULT_THEME.echartsTheme)

if (SQL) {
  console.log(`加载 SQL`)
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
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    OcapCoreModule.forRoot([new DuckdbWasmAgent([{
      name: 'WASM',
      type: '',
      schemaName: 'main',
      entities: [
        {
          name: 'CsseCovid19Daily',
          sourceUrl: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/04-28-2022.csv',
        },
        {
          name: 'CountryGDP',
          sourceUrl: `https://raw.githubusercontent.com/curran/data/gh-pages/worldFactbook/GDPPerCapita.csv`
        }
      ]
    }]), new MockAgent()], {
      Sales: {
        name: 'Sales',
        type: 'SQL',
        agentType: AgentType.Browser
      },
      WASM: {
        name: 'WASM',
        type: 'SQL',
        agentType: AgentType.Wasm
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
