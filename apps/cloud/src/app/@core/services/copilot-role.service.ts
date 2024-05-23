import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { NGXLogger } from 'ngx-logger'
import { map } from 'rxjs'
import { API_COPILOT_ROLE } from '../constants/app.constants'
import { ICopilotRole } from '../types'


@Injectable({ providedIn: 'root' })
export class CopilotRoleService {
  readonly #logger = inject(NGXLogger)
  readonly httpClient = inject(HttpClient)

  getAll() {
    return this.httpClient.get<{ items: ICopilotRole[] }>(`${API_COPILOT_ROLE}`).pipe(
      map(({ items }) => items)
    )
  }

  getById(id: string) {
    return this.httpClient.get<ICopilotRole>(`${API_COPILOT_ROLE}/${id}`)
  }

  create(entity: Partial<ICopilotRole>) {
    return this.httpClient.post<ICopilotRole>(`${API_COPILOT_ROLE}`, entity)
  }

  update(id: string, entity: Partial<ICopilotRole>) {
    return this.httpClient.put<ICopilotRole>(`${API_COPILOT_ROLE}/${id}`, entity)
  }

  delete(id: string) {
    return this.httpClient.delete(`${API_COPILOT_ROLE}/${id}`)
  }
}