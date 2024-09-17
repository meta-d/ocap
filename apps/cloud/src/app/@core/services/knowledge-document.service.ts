import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { DocumentInterface } from '@langchain/core/documents'
import { MaxMarginalRelevanceSearchOptions, VectorStoreInterface } from '@langchain/core/vectorstores'
import { API_PREFIX, OrganizationBaseCrudService } from '@metad/cloud/state'
import { IDocumentChunk, IKnowledgeDocument } from '@metad/contracts'
import { NGXLogger } from 'ngx-logger'

const API_KNOWLEDGE_DOCUMENT = API_PREFIX + '/knowledge-document'

@Injectable({ providedIn: 'root' })
export class KnowledgeDocumentService extends OrganizationBaseCrudService<IKnowledgeDocument> {
  readonly #logger = inject(NGXLogger)
  readonly httpClient = inject(HttpClient)

  constructor() {
    super(API_KNOWLEDGE_DOCUMENT)
  }

  createBulk(entites: Partial<IKnowledgeDocument>[]) {
    return this.httpClient.post<IKnowledgeDocument[]>(this.apiBaseUrl + '/bulk', entites)
  }

  startParsing(id: string) {
    return this.httpClient.post<IKnowledgeDocument[]>(this.apiBaseUrl + '/process', {
      ids: [ id ],
    })
  }

  stopParsing(id: string) {
    return this.httpClient.delete<IKnowledgeDocument[]>(this.apiBaseUrl + '/' + id + '/job')
  }

  getChunks(id: string) {
    return this.httpClient.get<IDocumentChunk[]>(this.apiBaseUrl + `/${id}` + '/chunk')
  }

  deleteChunk(documentId: string, id: string) {
    return this.httpClient.delete<void>(this.apiBaseUrl + `/` +documentId + '/chunk/' + id)
  }

  similaritySearch(
    query: string,
    options: { k?: number; filter?: VectorStoreInterface['FilterType']; role: string; score: number }
  ) {
    return this.httpClient.post<DocumentInterface[]>(`${this.apiBaseUrl}/similarity-search`, { query, options })
  }

  maxMarginalRelevanceSearch(
    query: string,
    options: MaxMarginalRelevanceSearchOptions<VectorStoreInterface['FilterType']> & {
      role: string
    }
  ) {
    return this.httpClient.post<DocumentInterface[]>(`${this.apiBaseUrl}/mmr-search`, { query, options })
  }
}
