import { inject, Injectable } from '@angular/core'
import { NGXLogger } from 'ngx-logger'
import { BehaviorSubject, Observable, tap } from 'rxjs'
import { API_XPERT_ROLE } from '../constants/app.constants'
import { IXpertRole, IXpertWorkspace } from '../types'
import { XpertWorkspaceBaseCrudService } from './xpert-workspace.service'

@Injectable({ providedIn: 'root' })
export class XpertRoleService extends XpertWorkspaceBaseCrudService<IXpertRole> {
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
}
