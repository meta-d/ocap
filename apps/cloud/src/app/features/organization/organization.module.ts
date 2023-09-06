import { NgModule } from '@angular/core'
import { MaterialModule, SharedModule } from '../../@shared'
import { OrganizationRoutingModule } from './organization-routing.module'
import { OrganizationComponent } from './organization.component'

@NgModule({
  declarations: [
    OrganizationComponent
  ],
  imports: [SharedModule, MaterialModule, OrganizationRoutingModule],
  providers: []
})
export class OrganizationModule {}
