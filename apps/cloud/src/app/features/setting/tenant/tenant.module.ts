import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { NxTableModule } from '@metad/components/table'
import { MaterialModule, SharedModule } from '../../../@shared'
import { DemoComponent } from './demo/demo.component'
import { SettingsComponent } from './settings/settings.component'
import { TenantRoutingModule } from './tenant-routing.module'
import { PACTenantComponent } from './tenant.component'

@NgModule({
  imports: [
    SharedModule,
    MaterialModule,
    RouterModule,
    TenantRoutingModule,
    OcapCoreModule,
    NxTableModule,
    NgmCommonModule
  ],
  exports: [],
  declarations: [PACTenantComponent, SettingsComponent, DemoComponent],
  providers: []
})
export class TenantModule {}
