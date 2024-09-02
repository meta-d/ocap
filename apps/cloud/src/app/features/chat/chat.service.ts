import { computed, effect, inject, Injectable, signal } from '@angular/core'
import { CopilotChatMessage } from '@metad/copilot'
import { IChatConversation, OrderTypeEnum } from '../../@core'
import { ChatConversationService, ChatService as ChatServerService } from '../../@core/services'
import { AppService } from '../../app.service'
import { firstValueFrom, map } from 'rxjs'

@Injectable()
export class ChatService {
  readonly chatService = inject(ChatServerService)
  readonly conversationService = inject(ChatConversationService)
  readonly appService = inject(AppService)

  readonly conversation = signal<IChatConversation>(null)
  readonly conversationId = computed(() => this.conversation()?.id)

  readonly messages = signal<CopilotChatMessage[]>([])

  // Conversations
  readonly conversations = signal<IChatConversation[]>([])

  constructor() {
    this.chatService.connect()
    this.chatService.on('message', (result) => {
      this.messages.update((messages) => {
        const index = messages.findIndex((message) => message.id === result.id)
        if (index > -1) {
          messages.splice(index, 1, { ...messages[index], content: messages[index].content + result.content })
        } else {
          messages.push({ ...result, role: 'assistant' })
        }
        return [...messages]
      })
    })

    this.conversationService.getAll({ order: { updatedAt: OrderTypeEnum.DESC }, take: 20 }).pipe(map(({ items }) => items)).subscribe((items) => {
      this.conversations.set(items)
    })

    effect(() => {
      if (this.conversation()) {
        this.messages.set(this.conversation().messages)
      }
    }, { allowSignalWrites: true })
  }

  message(id: string, content: string) {
    return this.chatService.message({
      id,
      conversationId: this.conversationId(),
      language: this.appService.lang(),
      content
    })
  }

  async newConversation() {
    const conversation = await firstValueFrom(this.conversationService.create({}))
    this.conversation.set(conversation)
    this.conversations.update((items) => [conversation, ...items])
  }

  setConversation(id: string) {
    this.conversation.set(this.conversations().find((item) => item.id === id))
  }

  deleteConversation(id: string) {
    this.conversations.update((items) => items.filter((item) => item.id !== id))
    this.conversationService.delete(id).subscribe({
      next: () => {
      }
    })
  }
}
