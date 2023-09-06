import { Component, HostBinding, OnInit } from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { IOrganizationCreateInput } from '@metad/contracts'

@UntilDestroy({ checkProperties: true })
@Component({
  templateUrl: './organization-mutation.component.html',
  styleUrls: ['./organization-mutation.component.scss']
})
export class OrganizationMutationComponent implements OnInit {
  @HostBinding('class.nx-dialog-container') isDialogContainer = true

  organization = {} as IOrganizationCreateInput

  ngOnInit(): void {}

  onApply() {
    
  }
}
