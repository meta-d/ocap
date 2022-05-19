import { ModuleWithProviders, NgModule } from '@angular/core'
import { NgmDSCoreService } from './core.service'
import { DensityDirective } from './displayDensity'

@NgModule({
  imports: [],
  exports: [
    DensityDirective
  ],
  declarations: [
    DensityDirective
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
