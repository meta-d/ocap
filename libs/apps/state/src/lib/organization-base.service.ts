import { inject } from '@angular/core'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { Store } from './store.service'

export class OrganizationBaseService {
  protected store = inject(Store)

  private readonly organizationId$ = this.store.selectedOrganization$.pipe(
    map((org) => org?.id),
    distinctUntilChanged()
  )

  selectOrganizationId() {
    return this.organizationId$
  }
}
