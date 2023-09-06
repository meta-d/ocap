import { DragDropModule } from '@angular/cdk/drag-drop'
import { NgModule } from '@angular/core'
import { ResizerBarDirective, ResizerDirective } from './resizer.directive'

@NgModule({
  imports: [
    DragDropModule
  ],
  exports: [DragDropModule, ResizerDirective, ResizerBarDirective],
  declarations: [ResizerDirective, ResizerBarDirective],
  providers: []
})
export class ResizerModule {}
