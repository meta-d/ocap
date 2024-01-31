import { CommonModule } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { FormControl } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import {
  OrganizationDemoNetworkEnum,
  OrganizationsService,
  ToastrService,
  getErrorMessage
} from 'apps/cloud/src/app/@core'
import { MaterialModule, SharedModule, TranslationBaseComponent } from 'apps/cloud/src/app/@shared'
import { firstValueFrom } from 'rxjs'
import { EditOrganizationComponent } from '../edit-organization/edit-organization.component'

@Component({
  standalone: true,
  selector: 'pac-organization-demo',
  templateUrl: './organization-demo.component.html',
  styleUrls: ['./organization-demo.component.scss'],
  imports: [CommonModule, SharedModule, MaterialModule, TranslateModule]
})
export class OrganizationDemoComponent extends TranslationBaseComponent {
  OrganizationDemoNetworkEnum = OrganizationDemoNetworkEnum

  readonly editOrganizationComponent = inject(EditOrganizationComponent)
  readonly orgsService = inject(OrganizationsService)
  readonly _toastrService = inject(ToastrService)

  source = new FormControl(OrganizationDemoNetworkEnum.github)

  readonly organization$ = this.editOrganizationComponent.organization
  readonly loading = signal(false)
  readonly generated = signal(false)

  /**
   * Generate or regenerate demo data for current organization
   */
  async generate() {
    try {
      this.loading.set(true)
      await firstValueFrom(this.orgsService.demo(this.organization$().id, {source: this.source.value}))
      this._toastrService.success('PAC.NOTES.ORGANIZATIONS.DEMO_GENERATED', { Default: 'Demo generated' })
      this.loading.set(false)
      this.generated.set(true)
    } catch (err) {
      this._toastrService.error(getErrorMessage(err))
      this.loading.set(false)
    }
  }
}
