import { ModuleWithProviders, NgModule } from '@angular/core'
import { MetadDSCoreService } from './core.service'

@NgModule({
  imports: [],
  exports: [],
  declarations: [],
  providers: []
})
export class OcapCoreModule {
  static forRoot(): ModuleWithProviders<OcapCoreModule> {
    return {
      ngModule: OcapCoreModule,
      providers: [
        MetadDSCoreService
      ]
    }
  }
}
