import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReteModule } from './render-plugin/module'
import { ERModelComponent } from './er-model.component'
import { MyNodeComponent } from './node/node.component'

@NgModule({
  imports: [CommonModule, ReteModule],
  exports: [ERModelComponent],
  declarations: [ERModelComponent, MyNodeComponent]
})
export class ERModelModule {}
