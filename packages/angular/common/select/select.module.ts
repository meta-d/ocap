import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NgmSelectComponent } from './select/select.component'
import { NgmOptionContent } from '../input/option-content'
import { NgmMatSelectComponent } from './mat/select.component'

@NgModule({
  declarations: [],
  imports: [CommonModule, NgmOptionContent, NgmSelectComponent, NgmMatSelectComponent],
  exports: [NgmOptionContent, NgmSelectComponent, NgmMatSelectComponent]
})
export class NgmSelectModule {}
