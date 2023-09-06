import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { ITag } from '@metad/contracts'
import { API_PREFIX } from '@metad/cloud/state'
import { map } from 'rxjs/operators'

export const C_API_TAG = API_PREFIX + '/tags'

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private readonly httpClient = inject(HttpClient)

  getAll(category?: string) {
    return this.httpClient.get<{items: ITag[]}>(C_API_TAG, {
      params: {
        data: JSON.stringify(category ? {
          findInput: {
            category
          }
        } : {})
      }
    }).pipe(map(({items}) => items))
  }

  create(input: Partial<ITag>) {
    return this.httpClient.post<ITag>(C_API_TAG, input)
  }

  update(id: string, input: Partial<ITag>) {
    return this.httpClient.put(`${C_API_TAG}/${id}`, input)
  }

  delete(id: string) {
    return this.httpClient.delete(`${C_API_TAG}/${id}`)
  }
}
