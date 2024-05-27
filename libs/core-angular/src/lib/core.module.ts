import { ModuleWithProviders, NgModule } from '@angular/core'
import { NgmTransformScaleDirective, ResizeObserverDirective } from './directives'
import {
  EntriesPipe,
  KeysPipe,
  PropertyPipe,
  SafePipe,
  ShortNumberPipe
} from './pipes/index'
import { NxCoreService } from './services'

/**
 * @deprecated Migrate to `@metad/ocap-angular/core`
 */
@NgModule({
  declarations: [
    ShortNumberPipe,
    KeysPipe,
    EntriesPipe,
    PropertyPipe,
    SafePipe,
  ],
  imports: [
    NgmTransformScaleDirective,
    ResizeObserverDirective
  ],
  exports: [
    ShortNumberPipe,
    KeysPipe,
    EntriesPipe,
    PropertyPipe,
    SafePipe,
    ResizeObserverDirective,
    NgmTransformScaleDirective
  ]
})
export class NxCoreModule {
  static forRoot(): ModuleWithProviders<NxCoreModule> {
    return {
      ngModule: NxCoreModule,
      providers: [
        NxCoreService,
      ]
    }
  }
}
