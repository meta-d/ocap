import { ModuleWithProviders, NgModule } from '@angular/core'
import { OcapDSCoreService } from './core.service'

@NgModule({
  imports: [],
  exports: [],
  declarations: [],
  providers: []
})
export class OcapCoreModule {
  static forRoot(config): ModuleWithProviders<OcapCoreModule> {
    return {
      ngModule: OcapCoreModule,
      providers: [
        {
          provide: OcapDSCoreService,
          useFactory: () => {
            return new OcapDSCoreService(config)
          }
        }
      ]
    }
  }
}
