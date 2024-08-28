import { HttpClient, HttpParams } from '@angular/common/http'
import { inject } from '@angular/core'
import { map } from 'rxjs'

export class CrudService<T> {
  protected readonly httpClient = inject(HttpClient)

  constructor(protected apiBaseUrl: string) {}

  getAll(options?: {relations?: string[];}) {
    const { relations } = options ?? {}
    let params = new HttpParams()
    if (relations?.length > 0) {
      params = params.append('$relations', JSON.stringify(relations))
    }
    return this.httpClient.get<{ items: T[]; total: number }>(this.apiBaseUrl, { params }).pipe(map(({ items }) => items))
  }

  create(entity: Partial<T>) {
    return this.httpClient.post(this.apiBaseUrl, entity)
  }

  update(id: string, entity: Partial<T>) {
    return this.httpClient.put(`${this.apiBaseUrl}/${id}`, entity)
  }

  delete(id: string) {
    return this.httpClient.delete(`${this.apiBaseUrl}/${id}`)
  }
}
