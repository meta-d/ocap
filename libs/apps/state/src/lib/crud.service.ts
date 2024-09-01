import { HttpClient, HttpParams } from '@angular/common/http'
import { inject } from '@angular/core'
import { OrderTypeEnum } from '@metad/contracts'
import { map } from 'rxjs'

export class CrudService<T> {
  protected readonly httpClient = inject(HttpClient)

  constructor(protected apiBaseUrl: string) {}

  getAll(options?: {
    where?: Record<string, string>
    relations?: string[]
    order?: Partial<{ [P in keyof T]: OrderTypeEnum }>
    take?: number
    skip?: number
  }) {
    const { where, relations, order, take, skip } = options ?? {}
    let params = new HttpParams()
    if (where) {
      params = params.append('$where', JSON.stringify(where))
    }
    if (relations?.length > 0) {
      params = params.append('$relations', JSON.stringify(relations))
    }
    if (order) {
      params = params.append('$order', JSON.stringify(order))
    }
    if (take != null) {
      params = params.append('$take', take)
    }
    if (skip != null) {
      params = params.append('$skip', skip)
    }
    return this.httpClient
      .get<{ items: T[]; total: number }>(this.apiBaseUrl, { params })
  }

  create(entity: Partial<T>) {
    return this.httpClient.post<T>(this.apiBaseUrl, entity)
  }

  update(id: string, entity: Partial<T>) {
    return this.httpClient.put(`${this.apiBaseUrl}/${id}`, entity)
  }

  delete(id: string) {
    return this.httpClient.delete(`${this.apiBaseUrl}/${id}`)
  }
}
