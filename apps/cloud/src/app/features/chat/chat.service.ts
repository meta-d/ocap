import { Location } from '@angular/common'
import { effect, inject, Injectable, signal } from '@angular/core'
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { CopilotBaseMessage, CopilotChatMessage, CopilotMessageGroup } from '@metad/copilot'
import { nonNullable } from '@metad/ocap-core'
import { injectParams } from 'ngxtension/inject-params'
import {
  BehaviorSubject,
  combineLatestWith,
  distinctUntilChanged,
  filter,
  map,
  of,
  pipe,
  skip,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs'
import {
  ChatGatewayEvent,
  ChatGatewayMessage,
  IChatConversation,
  ICopilotRole,
  ICopilotToolset,
  IKnowledgebase,
  LanguagesEnum,
  OrderTypeEnum
} from '../../@core'
import { ChatConversationService, ChatService as ChatServerService, CopilotRoleService } from '../../@core/services'
import { AppService } from '../../app.service'
import { derivedFrom } from 'ngxtension/derived-from'
import { COMMON_COPILOT_ROLE } from './types'


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
  readonly role$ = new BehaviorSubject<ICopilotRole>(null)
  readonly conversation = signal<IChatConversation>(null)

  readonly messages = signal<CopilotBaseMessage[]>([])

  // Conversations
  readonly conversations = signal<IChatConversation[]>([])

  readonly knowledgebases = signal<IKnowledgebase[]>([])
  readonly toolsets = signal<ICopilotToolset[]>([])

  readonly answering = signal<boolean>(false)

  readonly lang = this.appService.lang
  readonly roles = derivedFrom([this.copilotRoleService.getAll({ relations: ['knowledgebases'] }).pipe(map(({ items }) => items)), this.lang], pipe(
    map(([roles, lang]) => {
      if ([LanguagesEnum.SimplifiedChinese, LanguagesEnum.Chinese].includes(lang as LanguagesEnum)) {
        return roles?.map((role) => ({ ...role, title: role.titleCN }))
      } else {
        return roles
      }
    })
  ), {initialValue: []})
  readonly role = derivedFrom([this.role$, this.lang], pipe(
    map(([role, lang]) => {
      if (!role) {
        role = COMMON_COPILOT_ROLE
      }
      if ([LanguagesEnum.SimplifiedChinese, LanguagesEnum.Chinese].includes(lang as LanguagesEnum)) {
        return { ...role, title: role.titleCN }
      } else {
        return role
      }
    })
  ))

  private roleSub = this.role$
    .pipe(
      withLatestFrom(toObservable(this.paramRole)),
      filter(() => !this.conversationId()),
      takeUntilDestroyed()
    )
    .subscribe(([role, paramRole]) => {
      if (role?.name === 'common') {
        this.#location.replaceState('/chat')
      } else if (role?.name && role.name !== paramRole) {
        this.#location.replaceState('/chat/r/' + role.name)
      }

      if (!this.conversationId()) {
        // 默认启用所有知识库
        this.knowledgebases.set(role?.knowledgebases ?? [])
        // 默认使用所有工具集
        this.toolsets.set(role?.toolsets ?? [])
      }
    })
  private paramRoleSub = toObservable(this.paramRole)
    .pipe(combineLatestWith(toObservable(this.roles)), withLatestFrom(this.role$), takeUntilDestroyed())
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
      combineLatestWith(toObservable(this.roles)),
      takeUntilDestroyed()
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
      distinctUntilChanged(),
      takeUntilDestroyed()
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
    this.chatService.on('message', (result: ChatGatewayMessage) => {
      console.log('message return:', result)
      switch(result.event) {
        case ChatGatewayEvent.ChainStart: {
          this.messages.update((items) => [...items, {
            id: result.data.id,
            role: 'assistant',
            status: 'thinking'
          }])
          break
        }
        case ChatGatewayEvent.ConversationCreated: {
          this.conversation.set({ ...result.data, messages: [...this.messages()] })
          this.conversations.update((items) => [{ ...result.data }, ...items])
          break
        }
        case ChatGatewayEvent.MessageStream: {
          this.appendStreamMessage(result.data.content)
          break
        }
        case ChatGatewayEvent.StepStart: {
          this.appendMessageStep(result.data)
          break
        }
        case ChatGatewayEvent.StepEnd: {
          this.updateMessageStep(result.data)
          break
        }
        case ChatGatewayEvent.ToolStart: {
          this.appendMessageStep({
            id: result.data.id,
            role: 'tool',
            content: `调用工具: ${result.data.name}...`,
            status: 'thinking',
            name: result.data.name
          })
          break
        }
        case ChatGatewayEvent.ToolEnd: {
          this.updateMessageStep({
            id: result.data?.id,
            role: 'tool',
            content: `工具调用: ${result.data?.name} 已完成！`,
            status: 'done'
          })
          break
        }
        case ChatGatewayEvent.ChainEnd: {
          this.answering.set(false)
          this.updateMessage(result.data.id, {
            status: 'done'
          })
          break
        }
        case ChatGatewayEvent.ChainAborted: {
          this.answering.set(false)
          if (this.conversation()?.id === result.data.conversationId) {
            this.abortMessage(result.data.id)
          }
          break
        }
      }
    })

    this.conversationService
      .getAll({ select: ['id', 'key', 'title', 'updatedAt'], order: { updatedAt: OrderTypeEnum.DESC }, take: 20 })
      .pipe(
        map(({ items }) => items),
        takeUntilDestroyed()
      )
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
      event: ChatGatewayEvent.MessageStream,
      role: {
        id: this.role$.value?.id,
        knowledgebases: this.knowledgebases().map(({ id }) => id),
        toolsets: this.toolsets().map(({ id }) => id)
      },
      data: {
        conversationId: this.conversation()?.id,
        id,
        language: this.appService.lang(),
        content
      }
    })
  }

  cancelMessage() {
    this.answering.set(false)
    return this.chatService.message({
      event: ChatGatewayEvent.CancelChain,
      data: {
        conversationId: this.conversation().id,
      }
    })
  }

  async newConversation(role?: ICopilotRole) {
    if (this.answering() && this.conversation()?.id) {
      this.cancelMessage()
    }
    this.conversation.set(null)
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

  updateMessage(id: string, message: Partial<CopilotBaseMessage>) {
    this.messages.update((messages) => {
      const lastMessage = messages[messages.length - 1] as CopilotMessageGroup
      messages[messages.length - 1] = {...lastMessage, ...message}
      return [...messages]
    })
  }

  appendStreamMessage(content: string) {
    this.messages.update((messages) => {
      const lastMessage = messages[messages.length - 1] as CopilotMessageGroup
      lastMessage.content = (lastMessage.content ?? '') + content
      messages[messages.length - 1] = {...lastMessage}
      return [...messages]
    })
  }

  appendMessageStep(step: CopilotChatMessage) {
    this.messages.update((messages) => {
      const lastMessage = messages[messages.length - 1] as CopilotMessageGroup
      lastMessage.messages = [...(lastMessage.messages ?? []), step]
      messages[messages.length - 1] = {...lastMessage}
      return [...messages]
    })
  }

  updateMessageStep(step: CopilotChatMessage) {
    this.messages.update((messages) => {
      const lastMessage = messages[messages.length - 1] as CopilotMessageGroup
      const lastStep = lastMessage.messages[lastMessage.messages.length - 1]
      lastMessage.messages[lastMessage.messages.length - 1] = {
        ...lastStep,
        ...step
      }
      lastMessage.messages = [...lastMessage.messages]
      return [...messages]
    })
  }

  abortMessage(id: string) {
    this.messages.update((messages) => {
      const lastMessage = messages[messages.length - 1] as CopilotMessageGroup
      if (lastMessage.id === id) {
        lastMessage.messages = lastMessage.messages.map((m) => {
          if (m.status === 'thinking') {
            return {...m, status: 'aborted' }
          }
          return m
        })
        messages[messages.length - 1] = {...lastMessage, status: 'aborted'}
      }
      
      return [...messages]
    })
  }
}
