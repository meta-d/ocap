import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { PACIndicatorDirective } from './indicator.directive'
import { AppSparkLineDirective } from './sparkline.directive'

@NgModule({
  declarations: [AppSparkLineDirective, PACIndicatorDirective],
  imports: [CommonModule, FormsModule ],
  exports: [CommonModule, FormsModule, AppSparkLineDirective, PACIndicatorDirective]
})
export class SharedModule {}
