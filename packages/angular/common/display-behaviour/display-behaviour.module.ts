import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'

import { DisplayBehaviourComponent } from './display-behaviour.component'

@NgModule({
  imports: [CommonModule, MatIconModule],
  exports: [DisplayBehaviourComponent],
  declarations: [DisplayBehaviourComponent],
  providers: []
})
export class DisplayBehaviourModule {}
