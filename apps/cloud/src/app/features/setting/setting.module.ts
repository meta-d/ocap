import { NgModule } from '@angular/core'
import { provideFormlyMaterial } from '@metad/formly'
import { PACFormlyEmptyModule } from '@metad/formly/empty'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { ButtonGroupDirective } from '@metad/ocap-angular/core'
import { FormlyModule } from '@ngx-formly/core'
import { FormlyMaterialModule } from '@ngx-formly/material'
import { MaterialModule, SharedModule } from '../../@shared'
import { FeatureToggleModule } from '../../@shared/feature-toggle'
import { InviteMutationComponent } from '../../@shared/invite'
import { UserFormsModule } from '../../@shared/user/forms'
import { SettingRoutingModule } from './setting-routing.module'
import { PACSettingComponent } from './settings.component'
import { UserModule } from './users/user.module'

@NgModule({
  declarations: [PACSettingComponent],
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
    NgmCommonModule,

    InviteMutationComponent
  ],
  providers: [provideFormlyMaterial()]
})
export class SettingModule {}
