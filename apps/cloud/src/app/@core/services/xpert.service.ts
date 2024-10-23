import { inject, Injectable } from '@angular/core'
import { NGXLogger } from 'ngx-logger'
import { BehaviorSubject, tap } from 'rxjs'
import { API_XPERT_ROLE } from '../constants/app.constants'
import { IXpert, TXpertTeamDraft } from '../types'
import { XpertWorkspaceBaseCrudService } from './xpert-workspace.service'
import { toParams } from '@metad/ocap-angular/core'
import { PaginationParams, toHttpParams } from '@metad/cloud/state'

@Injectable({ providedIn: 'root' })
export class XpertService extends XpertWorkspaceBaseCrudService<IXpert> {
  readonly #logger = inject(NGXLogger)

  readonly #refresh = new BehaviorSubject<void>(null)

  constructor() {
    super(API_XPERT_ROLE)
  }

  create(entity: Partial<IXpert>) {
    return this.httpClient.post<IXpert>(this.apiBaseUrl, entity).pipe(tap(() => this.refresh()))
  }

  update(id: string, entity: Partial<IXpert>) {
    return this.httpClient.put<IXpert>(this.apiBaseUrl + `/${id}`, entity).pipe(tap(() => this.refresh()))
  }

  delete(id: string) {
    return this.httpClient.delete(this.apiBaseUrl + `/${id}`).pipe(tap(() => this.refresh()))
  }

  refresh() {
    this.#refresh.next()
  }

  getTeam(id: string, options?: PaginationParams<IXpert>) {
    return this.httpClient.get<IXpert>(this.apiBaseUrl + `/${id}/team`, { params: toHttpParams(options)})
  }

  getVersions(id: string) {
    return this.httpClient.get<{id: string; version: string; latest: boolean;}[]>(this.apiBaseUrl + `/${id}/version`)
  }

  saveDraft(id: string, draft: TXpertTeamDraft) {
    return this.httpClient.post<TXpertTeamDraft>(this.apiBaseUrl + `/${id}/draft`, draft)
  }

  publish(id: string) {
    return this.httpClient.post<IXpert>(this.apiBaseUrl + `/${id}/publish`, {})
  }

  validateTitle(title: string) {
    return this.httpClient.get<IXpert[]>(this.apiBaseUrl + `/validate`, {
      params: toParams({title})
    })
  }
}

export function convertToUrlPath(title: string) {
  return title?.toLowerCase() // 转换为小写
    .replace(/\s+/g, '-') // 替换空格为 -
    .replace(/[^a-z0-9-]/g, ''); // 移除非字母数字字符
}