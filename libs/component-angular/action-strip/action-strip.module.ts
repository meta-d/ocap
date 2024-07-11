import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IgxActionStripComponent, IgxActionStripMenuItemDirective } from './action-strip.component'

/**
 * @hidden
 */
@NgModule({
  declarations: [IgxActionStripComponent, IgxActionStripMenuItemDirective],
  exports: [IgxActionStripComponent, IgxActionStripMenuItemDirective],
  imports: [CommonModule]
})
export class NxActionStripModule {}
