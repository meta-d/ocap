import { A11yModule } from '@angular/cdk/a11y'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TreeTableModule } from '@metad/ocap-angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { FormlyModule } from '@ngx-formly/core'
import { TranslateModule } from '@ngx-translate/core'
import { NxTableModule } from '@metad/components/table'
import { SharedModule, UserProfileInlineComponent } from '../../../@shared'
import { InlineSearchComponent } from '../../../@shared/form-fields'
import { BusinessAreaInfoFormComponent } from './area-info-form/area-info-form.component'
import { BusinessAreaUsersComponent } from './area-users/area-users.component'
import { BusinessAreasRoutingModule } from './business-area-routing.module'
import { BusinessAreaComponent } from './business-area/business-area.component'
import { BusinessAreasComponent } from './business-areas/areas.component'

@NgModule({
  imports: [
    A11yModule,
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BusinessAreasRoutingModule,
    TranslateModule,
    FormlyModule,

    InlineSearchComponent,
    NxTableModule,
    UserProfileInlineComponent,

    // OCAP Modules
    OcapCoreModule,
    TreeTableModule
  ],
  exports: [BusinessAreasComponent, BusinessAreaComponent, BusinessAreaUsersComponent],
  declarations: [
    BusinessAreasComponent,
    BusinessAreaComponent,
    BusinessAreaUsersComponent,
    BusinessAreaInfoFormComponent
  ],
  providers: []
})
export class BusinessAreaModule {}
