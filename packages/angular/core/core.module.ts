import { ModuleWithProviders, NgModule } from '@angular/core'
import { NgxDSCoreService } from './core.service'

@NgModule({
  imports: [],
  exports: [],
  declarations: [],
  providers: []
})
export class OcapCoreModule {
  static forRoot(agents, config): ModuleWithProviders<OcapCoreModule> {
    return {
      ngModule: OcapCoreModule,
      providers: [
        {
          provide: NgxDSCoreService,
          useFactory: () => {
            return new NgxDSCoreService(agents, config)
          }
        }
      ]
    }
  }
}
