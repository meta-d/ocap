import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { NgxEchartsModule } from 'ngx-echarts'
import { AnalyticalCardComponent } from './analytical-card/analytical-card.component'

@NgModule({
  imports: [CommonModule, MatCardModule, MatButtonModule, NgxEchartsModule],
  declarations: [AnalyticalCardComponent],
  exports: [AnalyticalCardComponent]
})
export class OcapModule {}
