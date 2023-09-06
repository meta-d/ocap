import { NgModule } from '@angular/core'
import { SharedModule } from '../../../@shared'
import { FeaturesRoutingModule } from './features-routing.module'
import { PACFeaturesComponent } from './features.component'

@NgModule({
  imports: [SharedModule, FeaturesRoutingModule],
  exports: [],
  declarations: [PACFeaturesComponent],
  providers: []
})
export class FeaturesModule {}
