import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatRippleModule } from '@angular/material/core'
import { MatIconModule } from '@angular/material/icon'
import { MatTabsModule } from '@angular/material/tabs'
import { NgmBreadcrumbBarComponent } from './breadcrumb/breadcrumb.component'
import { DisplayBehaviourComponent } from './display-behaviour/display-behaviour.component'
import { ResizerModule } from './resizer/resizer.module'
import { SplitterModule } from './splitter/splitter.module'

@NgModule({
  imports: [CommonModule, MatIconModule, MatRippleModule, MatTabsModule, ResizerModule, SplitterModule],
  exports: [DisplayBehaviourComponent, NgmBreadcrumbBarComponent, ResizerModule, SplitterModule],
  declarations: [DisplayBehaviourComponent, NgmBreadcrumbBarComponent],
  providers: []
})
export class NgmCommonModule {}
