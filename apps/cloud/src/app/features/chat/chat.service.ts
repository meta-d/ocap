import { Location } from '@angular/common'
import { computed, effect, inject, Injectable, model, signal } from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { CopilotChatMessage } from '@metad/copilot'
import { injectParams } from 'ngxtension/inject-params'
import { combineLatestWith, distinctUntilChanged, filter, firstValueFrom, map, switchMap, tap, withLatestFrom } from 'rxjs'
import { IChatConversation, ICopilotRole, ICopilotToolset, IKnowledgebase, OrderTypeEnum } from '../../@core'
import { ChatConversationService, ChatService as ChatServerService, CopilotRoleService } from '../../@core/services'
import { AppService } from '../../app.service'
import { nonNullable } from '@metad/ocap-core'

@Injectable()
export class ChatService {
  readonly chatService = inject(ChatServerService)
  readonly conversationService = inject(ChatConversationService)
  readonly copilotRoleService = inject(CopilotRoleService)
  readonly appService = inject(AppService)
  readonly #router = inject(Router)
  readonly #route = inject(ActivatedRoute)
  readonly #location = inject(Location)
  readonly paramRole = injectParams('role')
  readonly paramId = injectParams('id')

  readonly role = signal<ICopilotRole>(null)
  readonly conversation = signal<IChatConversation>(null)
  readonly conversationId = computed(() => this.conversation()?.id)

  readonly messages = signal<CopilotChatMessage[]>([])

  // Conversations
  readonly conversations = signal<IChatConversation[]>([])

  readonly roles = toSignal(
    this.copilotRoleService.getAll({ relations: ['knowledgebases'] }).pipe(map(({ items }) => items))
  )
  readonly knowledgebases = signal<IKnowledgebase[]>([])
  readonly toolsets = signal<ICopilotToolset[]>([])

  private roleSub = toObservable(this.role)
    .pipe(
      withLatestFrom(toObservable(this.paramRole)),
      tap(([role, paramRole]) => {
        if (role?.name && role.name !== paramRole) {
          this.#location.replaceState('/chat/r/' + role.name)
        } else if (role?.name === 'common') {
          this.#location.replaceState('/chat')
        }
      })
    )
    .subscribe()
  private paramRoleSub = toObservable(this.paramRole)
    .pipe(combineLatestWith(toObservable(this.roles)), withLatestFrom(toObservable(this.role)))
    .subscribe(([[paramRole, roles], role]) => {
      if (roles && role?.name !== paramRole) {
        this.role.set(roles.find((item) => item.name === paramRole))
      }
    })
  private idSub = toObservable(this.paramId).pipe(
      filter((id) => id && this.conversation()?.id !== id),
      switchMap((id) => this.conversationService.getById(id, { relations: ['role'] }))
    ).subscribe((data) => this.conversation.set(data))

  private conversationSub = toObservable(this.conversation).pipe(
    filter(nonNullable),
    map((conversation) => conversation?.id),
    distinctUntilChanged(),
    // filter((id) =>!!id),
  ).subscribe((id) => {
    const roleName = this.paramRole()
    const paramId = this.paramId()
    // if (paramId !== id) {
    if (this.role()?.name) {
      if (id) {
        this.#location.replaceState('/chat/r/' + this.conversation().role.name + '/c/' + id)
      } else {
        this.#location.replaceState('/chat/r/' + this.conversation().role.name)
      }
    } else if (id) {
      this.#location.replaceState('/chat/c/' + id)
    } else {
      this.#location.replaceState('/chat/')
    }
    // }
  })

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

    this.conversationService
      .getAll({ select: ['id', 'key', 'title', 'updatedAt'], relations: ['role'], order: { updatedAt: OrderTypeEnum.DESC }, take: 20 })
      .pipe(map(({ items }) => items))
      .subscribe((items) => {
        this.conversations.set(items)
      })

    effect(
      () => {
        if (this.conversation()) {
          this.messages.set(this.conversation().messages)
        } else {
          this.messages.set([])
        }
      },
      { allowSignalWrites: true }
    )
  }

  message(id: string, content: string) {
    return this.chatService.message({
      role: {
        id: this.role()?.id,
        knowledgebases: this.knowledgebases().map(({id}) => id),
        toolsets: this.toolsets().map(({id}) => id),
      },
      message: {
        conversationId: this.conversationId(),
        id,
        language: this.appService.lang(),
        content
      },
    })
  }

  async newConversation(role?: ICopilotRole) {
    this.role.set(role)
    this.conversation.set({role} as IChatConversation)

  }

  setConversation(id: string) {
    const conversation = this.conversations().find((item) => item.id === id)
    this.role.set(conversation.role)
    this.conversation.set(conversation)
  }

  deleteConversation(id: string) {
    this.conversations.update((items) => items.filter((item) => item.id !== id))
    this.conversationService.delete(id).subscribe({
      next: () => {}
    })
  }

}
