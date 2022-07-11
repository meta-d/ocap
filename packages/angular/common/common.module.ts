import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatRippleModule } from '@angular/material/core'
import { MatIconModule } from '@angular/material/icon'
import { MatTabsModule } from '@angular/material/tabs'
import { NgmBreadcrumbBarComponent } from './breadcrumb/breadcrumb.component'
import { ResizeObserverModule } from './directives/resize-observer.module'
import { DisplayBehaviourModule } from './display-behaviour/display-behaviour.module'
import { ResizerModule } from './resizer/resizer.module'
import { SplitterModule } from './splitter/splitter.module'
import { TreeSelectModule } from './tree-select/tree-select.module'

@NgModule({
  imports: [CommonModule, MatIconModule, MatRippleModule, MatTabsModule, ResizerModule, SplitterModule],
  exports: [
    NgmBreadcrumbBarComponent,
    ResizerModule,
    SplitterModule,
    ResizeObserverModule,
    TreeSelectModule,
    DisplayBehaviourModule
  ],
  declarations: [NgmBreadcrumbBarComponent],
  providers: []
})
export class NgmCommonModule {}
