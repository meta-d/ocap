import { NgModule } from '@angular/core'
import { provideFormlyMaterial } from '@metad/formly'
import { PACFormlyEmptyModule } from '@metad/formly/empty'
import { ButtonGroupDirective } from '@metad/ocap-angular/core'
import { FormlyModule } from '@ngx-formly/core'
import { MaterialModule, SharedModule } from '../../@shared'
import { FeatureToggleModule } from '../../@shared/feature-toggle'
import { InviteMutationComponent } from '../../@shared/invite'
import { UserFormsModule } from '../../@shared/user/forms'
import { PACGeneralComponent } from './general/general.component'
import { SettingRoutingModule } from './setting-routing.module'
import { PACSettingComponent } from './settings.component'
import { UserModule } from './users/user.module'
import { FormlyMaterialModule } from '@ngx-formly/material'

@NgModule({
  declarations: [PACSettingComponent, PACGeneralComponent],
  imports: [
    SharedModule,
    MaterialModule,
    SettingRoutingModule,

    // Formly
    FormlyModule.forRoot(),
    PACFormlyEmptyModule,
    FormlyMaterialModule,

    FeatureToggleModule,
    UserModule,
    UserFormsModule,
    ButtonGroupDirective,

    InviteMutationComponent
  ],
  providers: [provideFormlyMaterial()]
})
export class SettingModule {}
