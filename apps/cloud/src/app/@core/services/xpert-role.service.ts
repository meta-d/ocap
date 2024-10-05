import { inject, Injectable } from '@angular/core'
import { OrganizationBaseCrudService } from '@metad/cloud/state'
import { NGXLogger } from 'ngx-logger'
import { BehaviorSubject, Observable, tap } from 'rxjs'
import { API_XPERT_ROLE } from '../constants/app.constants'
import { IXpertRole } from '../types'

@Injectable({ providedIn: 'root' })
export class XpertRoleService extends OrganizationBaseCrudService<IXpertRole> {
  readonly #logger = inject(NGXLogger)

  readonly #refresh = new BehaviorSubject<void>(null)

  constructor() {
    super(API_XPERT_ROLE)
  }

  create(entity: Partial<IXpertRole>) {
    return this.httpClient.post<IXpertRole>(`${API_XPERT_ROLE}`, entity).pipe(tap(() => this.refresh()))
  }

  update(id: string, entity: Partial<IXpertRole>) {
    return this.httpClient.put<IXpertRole>(`${API_XPERT_ROLE}/${id}`, entity).pipe(tap(() => this.refresh()))
  }

  delete(id: string) {
    return this.httpClient.delete(`${API_XPERT_ROLE}/${id}`).pipe(tap(() => this.refresh()))
  }

  refresh() {
    this.#refresh.next()
  }

  // updateKnowledgebases(roleId: string, knowledgebases: string[]): Observable<IXpertRole> {
  //   return this.httpClient.put<IXpertRole>(this.apiBaseUrl + '/' + roleId + '/knowledgebases', { knowledgebases })
  // }
}
