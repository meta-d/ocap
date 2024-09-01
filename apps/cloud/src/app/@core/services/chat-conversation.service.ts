import { Injectable } from '@angular/core'
import { API_PREFIX, OrganizationBaseCrudService } from '@metad/cloud/state'
import { IChatConversation } from '@metad/contracts'

@Injectable({ providedIn: 'root' })
export class ChatConversationService extends OrganizationBaseCrudService<IChatConversation> {
  constructor() {
    super(API_PREFIX + '/chat-conversation')
  }
}
