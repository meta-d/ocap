import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { IModelQuery } from '@metad/contracts'
import { omit, pick } from '@metad/ocap-core'
import { API_PREFIX } from '@metad/cloud/state'


@Injectable({ providedIn: 'root' })
export class ModelQueryService {
  constructor(private httpClient: HttpClient) {}

  create(input: Partial<IModelQuery>) {
    return this.httpClient.post<IModelQuery>(API_PREFIX + '/model-query', convertModelQueryInput(input))
  }

  update(id: string, input: Partial<IModelQuery>) {
    return this.httpClient.put(API_PREFIX + `/model-query/${id}`, convertModelQueryInput(input))
  }

  delete(id: string) {
    return this.httpClient.delete(API_PREFIX + `/model-query/${id}`)
  }
}

export function convertModelQueryInput(query: Partial<IModelQuery>) {
  return {
    ...pick(query, 'key', 'name', 'modelId', 'index'),
    options: pick(query, 'statement', 'entities', 'conversations')
  }
}

export function convertModelQueryResult(query: IModelQuery) {
  return {
    ...omit(query, 'statement', 'entities', 'options'),
    ...(query.options ?? {})
  }
}
