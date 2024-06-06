import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { DocumentInterface } from '@langchain/core/documents'
import { MaxMarginalRelevanceSearchOptions, VectorStoreInterface } from '@langchain/core/vectorstores'
import { NGXLogger } from 'ngx-logger'
import { map, tap } from 'rxjs'
import { API_COPILOT_EXAMPLE } from '../constants/app.constants'
import { ICopilotExample, ICopilotRole } from '../types'
import { CopilotRoleService } from './copilot-role.service'

@Injectable({ providedIn: 'root' })
export class CopilotExampleService {
  readonly #logger = inject(NGXLogger)
  readonly httpClient = inject(HttpClient)
  readonly roleService = inject(CopilotRoleService)

  similaritySearch(
    query: string,
    options: { k?: number; filter?: VectorStoreInterface['FilterType']; command: string; role: string; score: number }
  ) {
    return this.httpClient.post<DocumentInterface[]>(`${API_COPILOT_EXAMPLE}/similarity-search`, { query, options })
  }

  maxMarginalRelevanceSearch(
    query: string,
    options: MaxMarginalRelevanceSearchOptions<VectorStoreInterface['FilterType']> & {
      command: string
      role: string
    }
  ) {
    return this.httpClient.post<DocumentInterface[]>(`${API_COPILOT_EXAMPLE}/mmr-search`, { query, options })
  }

  getAll(options?: { relations: string[]; filter?: Record<string, any> }) {
    const { relations, filter } = options || {}
    return this.httpClient
      .get<{ items: ICopilotExample[] }>(`${API_COPILOT_EXAMPLE}`, {
        params: {
          $fitler: JSON.stringify(filter),
          $relations: JSON.stringify(relations)
        }
      })
      .pipe(map(({ items }) => items))
  }

  getById(id: string) {
    return this.httpClient.get<ICopilotExample>(`${API_COPILOT_EXAMPLE}/${id}`)
  }

  create(entity: Partial<ICopilotExample>) {
    return this.httpClient.post<ICopilotExample>(`${API_COPILOT_EXAMPLE}`, entity)
  }

  update(id: string, entity: Partial<ICopilotExample>) {
    return this.httpClient.put<ICopilotExample>(`${API_COPILOT_EXAMPLE}/${id}`, entity)
  }

  delete(id: string) {
    return this.httpClient.delete(`${API_COPILOT_EXAMPLE}/${id}`)
  }

  getCommands(filter: { role: string }) {
    return this.httpClient
      .get<ICopilotExample[]>(`${API_COPILOT_EXAMPLE}/commands`, {
        params: {
          $fitler: JSON.stringify(filter)
        }
      })
      .pipe(map((items) => items.map(({ command }) => command)))
  }

  createBulk(entities: ICopilotExample[], roles: ICopilotRole[], options: { clearRole: boolean }) {
    return this.httpClient
      .post<ICopilotExample[]>(`${API_COPILOT_EXAMPLE}/bulk`, {
        examples: entities,
        roles,
        options
      })
      .pipe(tap(() => this.roleService.refresh()))
  }
}
