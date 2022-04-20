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
import { AnalyticalCardModule } from '@metad/ocap-angular/analytical-card'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { MockAgent } from '@metad/ocap-core'
import * as SQL from '@metad/ocap-sql'
import { NgxEchartsModule } from 'ngx-echarts'
import { AppComponent } from './app.component'
import { NxWelcomeComponent } from './nx-welcome.component'
import { registerTheme } from 'echarts/core'
import { DEFAULT_THEME } from '@metad/ocap-echarts'

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
    HttpClientModule,
    FormsModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    OcapCoreModule.forRoot([new MockAgent()],
      {
        Sales: {
          name: 'Sales',
          type: 'SQL'
        }
      }
    ),
    AnalyticalCardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
