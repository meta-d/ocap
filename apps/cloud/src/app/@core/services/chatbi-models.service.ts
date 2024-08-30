import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { API_PREFIX, OrganizationBaseCrudService } from '@metad/cloud/state'
import { IChatBIModel } from '@metad/contracts'
import { NGXLogger } from 'ngx-logger'
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs'

const API_CHATBI_MODELS = API_PREFIX + '/chatbi-model'

@Injectable({ providedIn: 'root' })
export class ChatBIModelService extends OrganizationBaseCrudService<IChatBIModel> {
  readonly #logger = inject(NGXLogger)
  readonly httpClient = inject(HttpClient)

  readonly #refresh = new BehaviorSubject<void>(null)

  constructor() {
    super(API_CHATBI_MODELS)
  }

  // getAll() {
  //   return combineLatest([this.#refresh, this.selectOrganizationId()]).pipe(
  //     switchMap(() => this.httpClient.get<{ items: IChatBIModel[]; total: number }>(API_CHATBI_MODELS, { params: {
  //       $relations: JSON.stringify(['model'])
  //     } })),
  //     map(({ items }) => items)
  //   )
  // }

  refresh() {
    this.#refresh.next()
  }
}
