import { NgModule } from '@angular/core'
import { NgmDSCoreService } from './core.service'
import { AppearanceDirective, ButtonGroupDirective, DensityDirective } from './directives'
import { NgmOcapCoreService } from './services'

@NgModule({
  imports: [DensityDirective, AppearanceDirective, ButtonGroupDirective],
  exports: [DensityDirective, AppearanceDirective, ButtonGroupDirective],
  declarations: [],
  providers: []
})
export class OcapCoreModule {}

export function provideOcapCore() {
  return [NgmDSCoreService, NgmOcapCoreService]
}
