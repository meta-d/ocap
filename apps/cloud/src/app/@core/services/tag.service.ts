import { Injectable } from '@angular/core'
import { OrganizationBaseCrudService } from '@metad/cloud/state'
import { ITag } from '@metad/contracts'
import { Observable } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'
import { API_TAG } from '../constants/app.constants'

@Injectable({
  providedIn: 'root'
})
export class TagService extends OrganizationBaseCrudService<ITag> {
  /**
   * Cache tags by category
   */
  readonly #categories = new Map<string, Observable<ITag[]>>()

  constructor() {
    super(API_TAG)
  }

  getAllByCategory(category?: string) {
    if (!this.#categories.get(category ?? '')) {
      this.#categories.set(
        category ?? '',
        this.getAll({
          where: {
            category
          }
        }).pipe(
          map(({ items }) => items),
          shareReplay(1)
        )
      )
    }

    return this.#categories.get(category ?? '')
  }

  // getAll(category?: string) {
  //   return this.httpClient.get<{items: ITag[]}>(API_TAG, {
  //     params: {
  //       data: JSON.stringify(category ? {
  //         findInput: {
  //           category
  //         }
  //       } : {})
  //     }
  //   }).pipe(map(({items}) => items))
  // }

  // create(input: Partial<ITag>) {
  //   return this.httpClient.post<ITag>(C_API_TAG, input)
  // }

  // update(id: string, input: Partial<ITag>) {
  //   return this.httpClient.put(`${C_API_TAG}/${id}`, input)
  // }

  // delete(id: string) {
  //   return this.httpClient.delete(`${C_API_TAG}/${id}`)
  // }
}
