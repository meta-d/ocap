import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticalCardComponent } from './analytical-card/analytical-card.component';

@NgModule({
  imports: [CommonModule],
  declarations: [AnalyticalCardComponent],
  exports: [AnalyticalCardComponent],
})
export class OcapModule {}
