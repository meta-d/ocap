import { DragDropModule } from '@angular/cdk/drag-drop'
import { NgModule } from '@angular/core'
import { ResizerBarDirective, ResizerDirective } from './resizer.directive'

@NgModule({
  imports: [DragDropModule, ResizerDirective, ResizerBarDirective],
  exports: [DragDropModule, ResizerDirective, ResizerBarDirective],
  declarations: [],
  providers: []
})
export class ResizerModule {}
