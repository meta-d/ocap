import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { API_PREFIX, SystemPrivacyFields } from '@metad/cloud/state'
import { CopilotChatMessage } from '@metad/copilot'
import { Indicator } from '@metad/ocap-core'
import { omit } from 'lodash-es'
import { NGXLogger } from 'ngx-logger'
import { BehaviorSubject, map } from 'rxjs'
import { IChatBIConversation } from '../types'

const API_CHATBI_CONVERSATION = API_PREFIX + '/chatbi-conversation'

export interface ChatbiConverstion {
  id?: string
  key: string
  name: string
  modelId: string
  dataSource: string
  entity: string
  command: string
  messages: CopilotChatMessage[]
  indicators: Indicator[]
}

@Injectable({ providedIn: 'root' })
export class ChatBIConversationService {
  readonly #logger = inject(NGXLogger)
  readonly httpClient = inject(HttpClient)

  readonly #refresh = new BehaviorSubject<void>(null)

  getMy() {
    return this.httpClient
      .get<{ items: IChatBIConversation[] }>(API_CHATBI_CONVERSATION + '/my')
      .pipe(map(({ items }) => items.map(convertChatBIConversationResult)))
  }

  getById(id: string) {
    return this.httpClient
      .get<IChatBIConversation>(API_CHATBI_CONVERSATION + '/' + id)
      .pipe(map(convertChatBIConversationResult))
  }

  upsert(entity: Partial<ChatbiConverstion>) {
    return entity.id
      ? this.httpClient
          .put<ChatbiConverstion>(`${API_CHATBI_CONVERSATION}/${entity.id}`, convertChatBIConversation(entity))
          .pipe(map(() => entity as ChatbiConverstion))
      : this.httpClient
          .post<ChatbiConverstion>(API_CHATBI_CONVERSATION, convertChatBIConversation(entity))
          .pipe(map((result) => convertChatBIConversationResult(result)))
  }

  delete(id: string) {
    return this.httpClient.delete(`${API_CHATBI_CONVERSATION}/${id}`)
  }

  refresh() {
    this.#refresh.next()
  }
}

export function convertChatBIConversation(input: Partial<ChatbiConverstion>) {
  return {
    ...omit(input, 'messages', 'indicators'),
    options: {
      messages: input.messages,
      indicators: input.indicators,
    }
  } as IChatBIConversation
}

export function convertChatBIConversationResult(result: IChatBIConversation) {
  return {
    ...omit(result, 'options', ...SystemPrivacyFields),
    messages: result.options?.messages || [],
    indicators: result.options?.indicators
  } as ChatbiConverstion
}
