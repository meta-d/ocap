import { ModuleWithProviders, NgModule } from '@angular/core'
import { NgmDSCoreService } from './core.service'
import { AppearanceDirective } from './directives/appearance'
import { DensityDirective } from './directives/displayDensity'

@NgModule({
  imports: [],
  exports: [
    DensityDirective,
    AppearanceDirective
  ],
  declarations: [
    DensityDirective,
    AppearanceDirective
  ],
  providers: []
})
export class OcapCoreModule {
  static forRoot(): ModuleWithProviders<OcapCoreModule> {
    return {
      ngModule: OcapCoreModule,
      providers: [
        NgmDSCoreService
      ]
    }
  }
}
