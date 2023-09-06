import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { NxStoryDesignerModule } from '../story/story.module'
import { PinWidgetComponent } from './pin-widget/pin-widget.component'

@NgModule({
  declarations: [PinWidgetComponent],
  imports: [CommonModule, NxStoryDesignerModule],
  exports: [PinWidgetComponent],
})
export class PinModule {}
