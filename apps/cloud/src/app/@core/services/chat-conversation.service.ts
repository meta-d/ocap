import { Injectable } from '@angular/core'
import { API_PREFIX, OrganizationBaseCrudService, PaginationParams, toHttpParams } from '@metad/cloud/state'
import { IChatConversation } from '@metad/contracts'
import { switchMap } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class ChatConversationService extends OrganizationBaseCrudService<IChatConversation> {
  constructor() {
    super(API_PREFIX + '/chat-conversation')
  }

  getMyInOrg(options?: PaginationParams<IChatConversation>) {
    return this.selectOrganizationId().pipe(
      switchMap(() =>
        this.httpClient.get<{ items: IChatConversation[]; total: number }>(this.apiBaseUrl + '/my', {
          params: toHttpParams(options)
        })
      )
    )
  }

  findAllByXpert(xpertId: string, options: PaginationParams<IChatConversation>) {
    return this.httpClient.get<{items: IChatConversation[]}>(this.apiBaseUrl + `/xpert/${xpertId}`, { params: toHttpParams(options) })
  }
}
