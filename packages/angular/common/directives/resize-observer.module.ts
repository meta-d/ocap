import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ResizeObserverDirective } from './resize-observer.directive'

@NgModule({
  imports: [CommonModule],
  exports: [ResizeObserverDirective],
  declarations: [ResizeObserverDirective],
  providers: []
})
export class ResizeObserverModule {}
