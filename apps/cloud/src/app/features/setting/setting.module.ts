import { NgModule } from '@angular/core'
import { ButtonGroupDirective } from '@metad/ocap-angular/core'
import { FormlyModule } from '@ngx-formly/core'
import { FormlyMaterialModule } from '@ngx-formly/material'
import { PACFormlyEmptyModule } from '@metad/formly/empty'
import { MaterialModule, SharedModule } from '../../@shared'
import { FeatureToggleModule } from '../../@shared/feature-toggle'
import { InviteMutationComponent } from '../../@shared/invite'
import { UserFormsModule } from '../../@shared/user/forms'
import { PACGeneralComponent } from './general/general.component'
import { SettingRoutingModule } from './setting-routing.module'
import { PACSettingComponent } from './settings.component'
import { UserModule } from './users/user.module'

@NgModule({
  declarations: [
    PACSettingComponent,
    PACGeneralComponent,
  ],
  imports: [
    SharedModule,
    MaterialModule,
    SettingRoutingModule,

    // Formly
    FormlyModule.forRoot(),
    FormlyMaterialModule,
    PACFormlyEmptyModule,

    FeatureToggleModule,
    UserModule,
    UserFormsModule,
    ButtonGroupDirective,

    InviteMutationComponent
  ]
})
export class SettingModule {}
