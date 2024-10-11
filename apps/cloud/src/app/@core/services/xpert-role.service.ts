import { inject, Injectable } from '@angular/core'
import { NGXLogger } from 'ngx-logger'
import { BehaviorSubject, Observable, tap } from 'rxjs'
import { API_XPERT_ROLE } from '../constants/app.constants'
import { IXpertRole, TXpertRoleDraft } from '../types'
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

  getTeam(id: string) {
    return this.httpClient.get<IXpertRole>(this.apiBaseUrl + `/${id}/team`)
  }

  getVersions(id: string) {
    return this.httpClient.get<{id: string; key: string; version: string; latest: boolean;}[]>(this.apiBaseUrl + `/${id}/version`)
  }

  saveDraft(id: string, draft: TXpertRoleDraft) {
    return this.httpClient.put<TXpertRoleDraft>(this.apiBaseUrl + `/${id}/draft`, draft)
  }

  publish(id: string) {
    return this.httpClient.post<IXpertRole>(this.apiBaseUrl + `/${id}/publish`, {})
  }

  validateName(name: string) {
    return this.httpClient.get<IXpertRole[]>(this.apiBaseUrl + `/validate-name/${name}`)
  }
}

export function convertToUrlPath(title: string) {
  return title?.toLowerCase() // 转换为小写
    .replace(/\s+/g, '-') // 替换空格为 -
    .replace(/[^a-z0-9-]/g, ''); // 移除非字母数字字符
}