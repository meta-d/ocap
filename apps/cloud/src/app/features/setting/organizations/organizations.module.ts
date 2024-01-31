import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { OrgAvatarComponent, OrgAvatarEditorComponent, SharedModule } from '../../../@shared'
import { OrganizationMutationComponent } from './organization-mutation/organization-mutation.component'
import { OrganizationStepFormComponent } from './organization-step-form/organization-step-form.component'
import { OrganizationsRoutingModule } from './organizations-routing.module'
import { OrganizationsComponent } from './organizations.component'
import { NgmTableComponent } from '@metad/ocap-angular/common'

@NgModule({
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    OrganizationsRoutingModule,
    OrgAvatarEditorComponent,
    OrgAvatarComponent,
    NgmTableComponent
  ],
  declarations: [
    OrganizationsComponent,
    OrganizationStepFormComponent,
    OrganizationMutationComponent,
  ],
  providers: []
})
export class OrganizationsModule {}
