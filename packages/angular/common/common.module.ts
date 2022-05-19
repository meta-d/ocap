import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatRippleModule } from '@angular/material/core'
import { MatIconModule } from '@angular/material/icon'
import { MatTabsModule } from '@angular/material/tabs'
import { NgmBreadcrumbBarComponent } from './breadcrumb/breadcrumb.component'
import { DisplayBehaviourComponent } from './display-behaviour/display-behaviour.component'

@NgModule({
  imports: [CommonModule, MatIconModule, MatRippleModule, MatTabsModule],
  exports: [DisplayBehaviourComponent, NgmBreadcrumbBarComponent],
  declarations: [DisplayBehaviourComponent, NgmBreadcrumbBarComponent],
  providers: []
})
export class NgmCommonModule {}
