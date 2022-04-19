import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { NgxEchartsModule } from 'ngx-echarts'

@NgModule({
  imports: [CommonModule, MatCardModule, MatButtonModule, NgxEchartsModule],
  declarations: [],
  exports: []
})
export class OcapModule {}
