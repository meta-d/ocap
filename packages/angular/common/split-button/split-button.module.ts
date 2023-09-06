import { NgModule } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

import { SplitButtonComponent } from './split-button.component'

@NgModule({
  imports: [MatButtonModule, MatIconModule],
  exports: [SplitButtonComponent],
  declarations: [SplitButtonComponent],
  providers: []
})
export class SplitButtonModule {}
