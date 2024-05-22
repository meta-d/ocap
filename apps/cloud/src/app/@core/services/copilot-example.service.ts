import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { DocumentInterface } from '@langchain/core/documents'
import { VectorStoreInterface, MaxMarginalRelevanceSearchOptions } from '@langchain/core/vectorstores'
import { NGXLogger } from 'ngx-logger'
import { firstValueFrom } from 'rxjs'
import { API_COPILOT_EXAMPLE } from '../constants/app.constants'


@Injectable({ providedIn: 'root' })
export class CopilotExampleService {
  readonly #logger = inject(NGXLogger)
  readonly httpClient = inject(HttpClient)

  async similaritySearch(query: string, k?: number, filter?: VectorStoreInterface["FilterType"]): Promise<DocumentInterface[]> {
    return await firstValueFrom(this.httpClient.post<DocumentInterface[]>(`${API_COPILOT_EXAMPLE}/similarity-search`, { query, options: {k, filter} }))
  }

  async maxMarginalRelevanceSearch(query: string, options: MaxMarginalRelevanceSearchOptions<VectorStoreInterface["FilterType"]>,): Promise<DocumentInterface[]> {
    return await firstValueFrom(this.httpClient.post<DocumentInterface[]>(`${API_COPILOT_EXAMPLE}/mmr-search`, { query, options }))
  }
}