import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { FormlyMatToggleModule } from '@ngx-formly/material/toggle'
import { NxTableModule } from '@metad/components/table'
import { OrgAvatarComponent, OrgAvatarEditorComponent, SharedModule } from '../../../@shared'
import { EditOrganizationComponent } from './edit-organization/edit-organization.component'
import { OrganizationDemoComponent } from './organization-demo/organization-demo.component'
import { OrganizationMutationComponent } from './organization-mutation/organization-mutation.component'
import { OrganizationStepFormComponent } from './organization-step-form/organization-step-form.component'
import { OrganizationsRoutingModule } from './organizations-routing.module'
import { OrganizationsComponent } from './organizations.component'

@NgModule({
  imports: [
    SharedModule,
    FormsModule,
    FormlyMatToggleModule,
    ReactiveFormsModule,
    OrganizationsRoutingModule,
    NxTableModule,
    OrgAvatarEditorComponent,
    OrgAvatarComponent
  ],
  declarations: [
    OrganizationsComponent,
    EditOrganizationComponent,
    OrganizationStepFormComponent,
    OrganizationMutationComponent,
    OrganizationDemoComponent
  ],
  providers: []
})
export class OrganizationsModule {}
