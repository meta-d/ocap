import { ModuleWithProviders, NgModule } from '@angular/core'
import { NgmShortNumberPipe } from '@metad/ocap-angular/core'
import { NgmTransformScaleDirective, ResizeObserverDirective } from './directives'
import { EntriesPipe, KeysPipe, PropertyPipe, SafePipe } from './pipes/index'
import { NxCoreService } from './services'

/**
 * @deprecated Migrate to `@metad/ocap-angular/core`
 */
@NgModule({
  declarations: [KeysPipe, EntriesPipe, PropertyPipe, SafePipe],
  imports: [NgmTransformScaleDirective, ResizeObserverDirective, NgmShortNumberPipe],
  exports: [
    KeysPipe,
    EntriesPipe,
    PropertyPipe,
    SafePipe,
    ResizeObserverDirective,
    NgmTransformScaleDirective,
    NgmShortNumberPipe
  ]
})
export class NxCoreModule {
  static forRoot(): ModuleWithProviders<NxCoreModule> {
    return {
      ngModule: NxCoreModule,
      providers: [NxCoreService]
    }
  }
}
