import { Component, HostBinding, OnInit } from '@angular/core'
import { IOrganizationCreateInput } from '@metad/contracts'

@Component({
  templateUrl: './organization-mutation.component.html',
  styleUrls: ['./organization-mutation.component.scss']
})
export class OrganizationMutationComponent implements OnInit {
  @HostBinding('class.ngm-dialog-container') isDialogContainer = true

  organization = {} as IOrganizationCreateInput

  ngOnInit(): void {}

  onApply() {
    
  }
}
