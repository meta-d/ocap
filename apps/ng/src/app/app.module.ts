import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { OcapModule } from '@metad/ocap-angular'
import { NgxEchartsModule } from 'ngx-echarts'
import { AppComponent } from './app.component'
import { NxWelcomeComponent } from './nx-welcome.component'

@NgModule({
  declarations: [AppComponent, NxWelcomeComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    OcapModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
