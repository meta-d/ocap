import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { DocumentInterface } from '@langchain/core/documents'
import { API_PREFIX, OrganizationBaseCrudService, PaginationParams, toHttpParams } from '@metad/cloud/state'
import { IKnowledgebase } from '@metad/contracts'
import { NGXLogger } from 'ngx-logger'
import { switchMap } from 'rxjs/operators'

const API_KNOWLEDGEBASE = API_PREFIX + '/knowledgebase'

@Injectable({ providedIn: 'root' })
export class KnowledgebaseService extends OrganizationBaseCrudService<IKnowledgebase> {
  readonly #logger = inject(NGXLogger)
  readonly httpClient = inject(HttpClient)

  constructor() {
    super(API_KNOWLEDGEBASE)
  }

  getMyAllInOrg(options?: PaginationParams<IKnowledgebase>) {
    return this.selectOrganizationId().pipe(
      switchMap(() =>
        this.httpClient.get<{ items: IKnowledgebase[]; total: number }>(this.apiBaseUrl + '/my', {
          params: toHttpParams(options)
        })
      )
    )
  }
  getAllByPublicInOrg(options?: PaginationParams<IKnowledgebase>) {
    return this.selectOrganizationId().pipe(
      switchMap(() =>
        this.httpClient.get<{ items: IKnowledgebase[]; total: number }>(this.apiBaseUrl + '/public', {
          params: toHttpParams(options)
        })
      )
    )
  }

  test(id: string, options: { query: string; k: number; score: number; filter?: Record<string, unknown> }) {
    return this.httpClient.post<{ doc: DocumentInterface; score: number }[]>(
      this.apiBaseUrl + '/' + id + '/test',
      options
    )
  }
}
