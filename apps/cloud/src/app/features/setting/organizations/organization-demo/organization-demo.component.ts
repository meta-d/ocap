import { Component, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { UntilDestroy } from '@ngneat/until-destroy'
import { OrganizationsService, ToastrService, getErrorMessage } from 'apps/cloud/src/app/@core'
import { TranslationBaseComponent } from 'apps/cloud/src/app/@shared'
import { firstValueFrom } from 'rxjs'
import { EditOrganizationComponent } from '../edit-organization/edit-organization.component'

@UntilDestroy({ checkProperties: true })
@Component({
  templateUrl: './organization-demo.component.html',
  styleUrls: ['./organization-demo.component.scss']
})
export class OrganizationDemoComponent extends TranslationBaseComponent {
  public editOrganizationComponent = inject(EditOrganizationComponent)
  private orgsService = inject(OrganizationsService)
  private readonly _toastrService = inject(ToastrService)

  private readonly organization = toSignal(this.editOrganizationComponent.organization$)
  public readonly loading = signal(false)
  public readonly generated = signal(false)

  async generate() {
    try {
      this.loading.set(true)
      await firstValueFrom(this.orgsService.demo(this.organization().id))
      this._toastrService.success('PAC.NOTES.ORGANIZATIONS.DEMO_GENERATED', { Default: 'Demo generated' })
      this.loading.set(false)
      this.generated.set(true)
    } catch (err) {
      this._toastrService.error(getErrorMessage(err))
      this.loading.set(false)
    }
  }
}
