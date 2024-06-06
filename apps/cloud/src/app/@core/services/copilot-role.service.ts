import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { NGXLogger } from 'ngx-logger'
import { BehaviorSubject, map, shareReplay, switchMap, tap } from 'rxjs'
import { API_COPILOT_ROLE } from '../constants/app.constants'
import { ICopilotRole } from '../types'

@Injectable({ providedIn: 'root' })
export class CopilotRoleService {
  readonly #logger = inject(NGXLogger)
  readonly httpClient = inject(HttpClient)

  readonly #refresh = new BehaviorSubject<void>(null)

  readonly #allRoles$ = this.#refresh.pipe(
    switchMap(() =>
      this.httpClient.get<{ items: ICopilotRole[] }>(`${API_COPILOT_ROLE}`).pipe(map(({ items }) => items))
    ),
    shareReplay(1)
  )

  getAll() {
    return this.#allRoles$
  }

  getById(id: string) {
    return this.httpClient.get<ICopilotRole>(`${API_COPILOT_ROLE}/${id}`)
  }

  create(entity: Partial<ICopilotRole>) {
    return this.httpClient.post<ICopilotRole>(`${API_COPILOT_ROLE}`, entity).pipe(tap(() => this.refresh()))
  }

  update(id: string, entity: Partial<ICopilotRole>) {
    return this.httpClient.put<ICopilotRole>(`${API_COPILOT_ROLE}/${id}`, entity).pipe(tap(() => this.refresh()))
  }

  delete(id: string) {
    return this.httpClient.delete(`${API_COPILOT_ROLE}/${id}`).pipe(tap(() => this.refresh()))
  }

  refresh() {
    this.#refresh.next()
  }
}
