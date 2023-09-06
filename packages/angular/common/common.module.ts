import { NgModule } from '@angular/core'
import { AppearanceDirective, ButtonGroupDirective, DensityDirective, OcapCoreModule } from '@metad/ocap-angular/core'
import { NgmBreadcrumbBarComponent } from './breadcrumb/breadcrumb.component'
import { ResizeObserverDirective } from './directives'
import { NgmDisplayBehaviourComponent } from './display-behaviour'
import { NgmInputModule } from './input/input.module'
import { ResizerModule } from './resizer/resizer.module'
import { NgmSearchComponent } from './search/search.component'
import { NgmMatSelectComponent, NgmSelectComponent } from './select'
import { NgmSliderInputComponent } from './slider-input'
import { SplitterModule } from './splitter/splitter.module'
import { TableVirtualScrollModule } from './table'
import { NgmTagsComponent } from './tag'
import { NgmTreeSelectComponent } from './tree-select'

@NgModule({
  imports: [
    ResizerModule,
    SplitterModule,

    OcapCoreModule,
    ResizeObserverDirective,
    NgmBreadcrumbBarComponent,
    NgmSearchComponent,
    TableVirtualScrollModule,
    NgmTreeSelectComponent,
    NgmMatSelectComponent,
    NgmSelectComponent,
    NgmDisplayBehaviourComponent,
    NgmSliderInputComponent,
    NgmInputModule,
    NgmTagsComponent,
    DensityDirective,
    ButtonGroupDirective,
    AppearanceDirective
  ],
  exports: [
    ResizerModule,
    SplitterModule,
    NgmBreadcrumbBarComponent,
    ResizeObserverDirective,
    NgmDisplayBehaviourComponent,
    NgmSearchComponent,
    TableVirtualScrollModule,
    NgmTreeSelectComponent,
    NgmMatSelectComponent,
    NgmSelectComponent,
    NgmSliderInputComponent,
    NgmInputModule,
    NgmTagsComponent,
    DensityDirective,
    ButtonGroupDirective,
    AppearanceDirective
  ],
  declarations: [],
  providers: []
})
export class NgmCommonModule {}
