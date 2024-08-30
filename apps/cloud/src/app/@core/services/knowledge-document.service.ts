import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
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

  getChunks(id: string) {
    return this.httpClient.get<IDocumentChunk[]>(this.apiBaseUrl + `/${id}` + '/chunk')
  }

  deleteChunk(documentId: string, id: string) {
    return this.httpClient.delete<void>(this.apiBaseUrl + `/` +documentId + '/chunk/' + id)
  }
}
