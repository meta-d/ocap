import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FlexLayoutModule } from '@angular/flex-layout'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { TranslateModule } from '@ngx-translate/core'
import { NgxEchartsModule } from 'ngx-echarts'
import { NgmCommonModule } from '../common'
import { OcapCoreModule } from '../core'
import { AnalyticalCardComponent } from './analytical-card.component'

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    NgxEchartsModule,
    TranslateModule,
    NgmCommonModule,
    OcapCoreModule
  ],
  declarations: [AnalyticalCardComponent],
  exports: [AnalyticalCardComponent]
})
export class AnalyticalCardModule {}
