import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FlexLayoutModule } from '@angular/flex-layout'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { NgxEchartsModule } from 'ngx-echarts'
import { AnalyticalCardComponent } from './analytical-card.component'

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    NgxEchartsModule
  ],
  declarations: [AnalyticalCardComponent],
  exports: [AnalyticalCardComponent]
})
export class AnalyticalCardModule {}
