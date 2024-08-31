import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { DocumentInterface } from '@langchain/core/documents'
import { API_PREFIX, OrganizationBaseCrudService } from '@metad/cloud/state'
import { IKnowledgebase } from '@metad/contracts'
import { NGXLogger } from 'ngx-logger'

const API_KNOWLEDGEBASE = API_PREFIX + '/knowledgebase'

@Injectable({ providedIn: 'root' })
export class KnowledgebaseService extends OrganizationBaseCrudService<IKnowledgebase> {
  readonly #logger = inject(NGXLogger)
  readonly httpClient = inject(HttpClient)

  constructor() {
    super(API_KNOWLEDGEBASE)
  }

  test(id: string, options: { query: string; k: number; score: number; filter?: Record<string, unknown> }) {
    return this.httpClient.post<[DocumentInterface, number][]>(this.apiBaseUrl + '/' + id + '/test', options)
  }
}
