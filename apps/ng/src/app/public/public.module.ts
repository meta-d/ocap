import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { AnalyticalCardModule } from '@metad/ocap-angular/analytical-card'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { PublicRoutingModule } from './public-routing.module'
import { PublicComponent } from './public.component'

@NgModule({
  imports: [CommonModule, PublicRoutingModule, AnalyticalCardModule, OcapCoreModule],
  exports: [],
  declarations: [PublicComponent],
  providers: []
})
export class PublicModule {}
