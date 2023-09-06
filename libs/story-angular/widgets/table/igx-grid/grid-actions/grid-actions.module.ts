import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IgxActionStripModule } from 'igniteui-angular'
import { SmartGridActionsComponent } from './grid-actions/grid-actions.component'

@NgModule({
  declarations: [SmartGridActionsComponent],
  imports: [CommonModule, IgxActionStripModule],
  exports: [SmartGridActionsComponent],
})
export class GridActionsModule {}
