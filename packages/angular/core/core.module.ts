import { ModuleWithProviders, NgModule } from '@angular/core'
import { NgmDSCoreService } from './core.service'
import { AppearanceDirective, ButtonGroupDirective, DensityDirective } from './directives'

@NgModule({
  imports: [DensityDirective, AppearanceDirective, ButtonGroupDirective],
  exports: [DensityDirective, AppearanceDirective, ButtonGroupDirective],
  declarations: [],
  providers: []
})
export class OcapCoreModule {
  /**
   * @deprecated use provideOcapCore()
   */
  static forRoot(): ModuleWithProviders<OcapCoreModule> {
    return {
      ngModule: OcapCoreModule,
      providers: provideOcapCore()
    }
  }
}

export function provideOcapCore() {
  return [NgmDSCoreService]
}
