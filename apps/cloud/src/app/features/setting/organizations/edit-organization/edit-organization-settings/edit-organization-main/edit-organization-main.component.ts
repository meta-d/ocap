import { ChangeDetectorRef, Component, inject } from '@angular/core'
import { UntypedFormGroup } from '@angular/forms'
import { Router } from '@angular/router'
import { IOrganization } from '@metad/contracts'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { TranslateService } from '@ngx-translate/core'
import { getErrorMessage } from '@metad/core'
import { firstValueFrom } from 'rxjs'
import { OrganizationsService, ToastrService } from '../../../../../../@core'
import { EditOrganizationComponent } from '../../edit-organization.component'

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'pac-edit-org-main',
  templateUrl: './edit-organization-main.component.html',
  styleUrls: ['./edit-organization-main.component.scss']
})
export class EditOrganizationMainComponent {
  private readonly toastrService = inject(ToastrService)

  form = new UntypedFormGroup({})
  model = {} as IOrganization
  fields: FormlyFieldConfig[] = []

  constructor(
    public editOrganizationComponent: EditOrganizationComponent,
    private readonly router: Router,
    private readonly organizationService: OrganizationsService,
    readonly translateService: TranslateService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  handleImageUploadError(event: any) {}

  ngOnInit(): void {
    this.editOrganizationComponent.organization$.pipe(untilDestroyed(this)).subscribe((org) => {
      this.form.patchValue(org)
      this.model = { ...org }
    })

    this.translateService.get('PAC.ORGANIZATIONS_PAGE.Organization').subscribe((Organization) => {
      this.fields = [
        {
          key: 'name',
          type: 'input',
          props: {
            label: Organization?.Name ?? 'Name',
            placeholder: Organization?.OrganizationName ?? 'Organization Name',
            appearance: 'fill'
          }
        },
        {
          key: 'isDefault',
          type: 'toggle',
          props: {
            label: Organization?.IsDefault ?? 'Is Default',
            placeholder: Organization?.SetAsDefault ?? 'Set as Default'
          }
        },
        {
          key: 'isActive',
          type: 'toggle',
          props: {
            label: Organization?.IsActive ?? 'Is Active',
            placeholder: Organization?.ActiveOrganization ?? 'Active Organization'
          }
        },
        {
          key: 'profile_link',
          type: 'input',
          props: {
            label: Organization?.ProfileLink ?? 'Profile Link',
            appearance: 'fill'
          }
        },
        {
          key: 'officialName',
          type: 'input',
          props: {
            label: Organization?.OfficialName ?? 'Official Name',
            appearance: 'fill'
          }
        },
        {
          key: 'short_description',
          type: 'textarea',
          props: {
            label: Organization?.ShortDescription ?? 'Short Description',
            appearance: 'fill',
            autosize: true
          }
        },
        {
          key: 'website',
          type: 'input',
          props: {
            label: Organization?.Website ?? 'Website',
            appearance: 'fill'
          }
        },
        {
          key: 'invitesAllowed',
          type: 'toggle',
          props: {
            label: Organization?.InvitesAllowed ?? 'Invites Allowed',
            placeholder: Organization?.EnableInvitesAllowed ?? 'Enable Invites Allowed'
          }
        },
        {
          key: 'inviteExpiryPeriod',
          type: 'input',
          props: {
            label: Organization?.InviteExpiryPeriod ?? 'Invite Expiry Period',
            placeholder: Organization?.InviteExpiryPeriod ?? 'Invite Expiry Period (in Days)',
            type: 'number',
            appearance: 'fill'
          }
        }
      ]
    })
  }

  onFormChange(model) {}

  async updateOrganizationSettings() {
    try {
      const organization = await firstValueFrom(
        this.organizationService.update(this.editOrganizationComponent.selectedOrg.id, {
          defaultValueDateType: this.editOrganizationComponent.selectedOrg.defaultValueDateType,
          ...this.form.value
        })
      )
      this.toastrService.success(`PAC.MESSAGE.MAIN_ORGANIZATION_UPDATED`, { Default: 'Main Org Updated' })
      this.goBack()
    } catch (error) {
      this.toastrService.error(getErrorMessage(error))
    }
  }

  goBack() {
    this.router.navigate([`/settings/organizations`])
  }
}
