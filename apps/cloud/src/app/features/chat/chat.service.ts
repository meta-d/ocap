import { Location } from '@angular/common'
import { effect, inject, Injectable, signal } from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { CopilotChatMessage } from '@metad/copilot'
import { nonNullable } from '@metad/ocap-core'
import { injectParams } from 'ngxtension/inject-params'
import { BehaviorSubject, combineLatestWith, distinctUntilChanged, filter, map, of, skip, switchMap, tap, withLatestFrom } from 'rxjs'
import { IChatConversation, ICopilotRole, ICopilotToolset, IKnowledgebase, OrderTypeEnum } from '../../@core'
import { ChatConversationService, ChatService as ChatServerService, CopilotRoleService } from '../../@core/services'
import { AppService } from '../../app.service'

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

  readonly conversationId = signal<string>(null)
  // readonly role = signal<ICopilotRole>(null)
  readonly role$ = new BehaviorSubject<ICopilotRole>(null)
  readonly conversation = signal<IChatConversation>(null)
  // readonly conversationId = computed(() => this.conversation()?.id)

  readonly messages = signal<CopilotChatMessage[]>([])

  // Conversations
  readonly conversations = signal<IChatConversation[]>([])

  readonly roles = toSignal(
    this.copilotRoleService.getAll({ relations: ['knowledgebases'] }).pipe(map(({ items }) => items))
  )
  readonly knowledgebases = signal<IKnowledgebase[]>([])
  readonly toolsets = signal<ICopilotToolset[]>([])

  readonly answering = signal<boolean>(false)

  private roleSub = this.role$
    .pipe(
      withLatestFrom(toObservable(this.paramRole)),
      filter(() => !this.conversationId())
    )
    .subscribe(([role, paramRole]) => {
      if (role?.name && role.name !== paramRole) {
        this.#location.replaceState('/chat/r/' + role.name)
      } else if (role?.name === 'common') {
        this.#location.replaceState('/chat')
      }

      if (!this.conversationId()) {
        // 默认启用所有知识库
        this.knowledgebases.set(role?.knowledgebases ?? [])
        // 默认使用所有工具集
        this.toolsets.set(role?.toolsets ?? [])
      }
    })
  private paramRoleSub = toObservable(this.paramRole)
    .pipe(combineLatestWith(toObservable(this.roles)), withLatestFrom(this.role$))
    .subscribe(([[paramRole, roles], role]) => {
      if (roles && role?.name !== paramRole) {
        this.role$.next(roles.find((item) => item.name === paramRole))
      }
    })
  private idSub = toObservable(this.conversationId)
    .pipe(
      skip(1),
      filter((id) => !this.conversation() || this.conversation().id !== id),
      switchMap((id) =>
        id ? this.conversationService.getById(id, { relations: ['role', 'role.knowledgebases'] }) : of(null)
      ),
      tap((data) => {
        if (data) {
          this.conversation.set(data)
          this.knowledgebases.set(
            data.options?.knowledgebases?.map((id) => data.role.knowledgebases?.find((item) => item.id === id))
          )
          this.toolsets.set(data.options?.toolsets?.map((id) => data.role.toolsets?.find((item) => item.id === id)))
        } else {
          // New empty conversation
          this.conversation.set({} as IChatConversation)
        }
      }),
      combineLatestWith(toObservable(this.roles))
    )
    .subscribe(([conversation, roles]) => {
      if (conversation) {
        this.role$.next(roles?.find((role) => role.id === conversation.roleId))
      }
    })

  private conversationSub = toObservable(this.conversation)
    .pipe(
      filter(nonNullable),
      map((conversation) => conversation?.id),
      distinctUntilChanged()
      // filter((id) =>!!id),
    )
    .subscribe((id) => {
      const roleName = this.paramRole()
      const paramId = this.paramId()
      // if (paramId !== id) {
      if (this.role$.value?.name) {
        if (id) {
          this.#location.replaceState('/chat/r/' + this.role$.value.name + '/c/' + id)
        } else {
          this.#location.replaceState('/chat/r/' + this.role$.value.name)
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

      this.answering.set(false)
    })

    this.conversationService
      .getAll({ select: ['id', 'key', 'title', 'updatedAt'], order: { updatedAt: OrderTypeEnum.DESC }, take: 20 })
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

    effect(
      () => {
        if (this.paramId()) {
          this.conversationId.set(this.paramId())
        }
      },
      { allowSignalWrites: true }
    )
  }

  message(id: string, content: string) {
    return this.chatService.message({
      role: {
        id: this.role$.value?.id,
        knowledgebases: this.knowledgebases().map(({ id }) => id),
        toolsets: this.toolsets().map(({ id }) => id)
      },
      message: {
        conversationId: this.conversationId(),
        id,
        language: this.appService.lang(),
        content
      }
    })
  }

  async newConversation(role?: ICopilotRole) {
    this.conversationId.set(null)
    this.role$.next(role)
  }

  setConversation(id: string) {
    // const conversation = this.conversations().find((item) => item.id === id)
    // this.role.set(conversation.role)
    this.conversationId.set(id)
    // this.conversation.set(conversation)
  }

  deleteConversation(id: string) {
    this.conversations.update((items) => items.filter((item) => item.id !== id))
    this.conversationService.delete(id).subscribe({
      next: () => {}
    })
  }
}
