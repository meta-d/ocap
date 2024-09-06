import { inject } from '@angular/core'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'
import { CrudService, PaginationParams } from './crud.service'
import { Store } from './store.service'

export class OrganizationBaseCrudService<T> extends CrudService<T> {
  protected store = inject(Store)

  private readonly organizationId$ = this.store.selectedOrganization$.pipe(
    map((org) => org?.id),
    distinctUntilChanged()
  )

  selectOrganizationId() {
    return this.organizationId$
  }

  getOneById(id: string) {
    return this.selectOrganizationId().pipe(switchMap(() => this.httpClient.get<T>(this.apiBaseUrl + '/' + id)))
  }

  getAllInOrg(options?: PaginationParams<T>) {
    return this.selectOrganizationId().pipe(switchMap(() => super.getAll(options)))
  }
}
