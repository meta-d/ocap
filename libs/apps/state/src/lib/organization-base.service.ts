import { distinctUntilChanged, map } from 'rxjs/operators'
import { Store } from './store.service'

export class OrganizationBaseService {
  public readonly organizationId$ = this.store.selectedOrganization$.pipe(map((org) => org?.id), distinctUntilChanged())

  constructor(protected store: Store) {}

  selectOrganizationId() {
    return this.organizationId$
  }
}
