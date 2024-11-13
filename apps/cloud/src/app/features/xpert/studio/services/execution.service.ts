import { computed, effect, inject, Injectable, signal } from '@angular/core'
import {
  ChatConversationService,
  CopilotChatMessage,
  IChatConversation,
  IXpertAgentExecution,
  XpertAgentExecutionEnum,
} from 'apps/cloud/src/app/@core'
import { derivedAsync } from 'ngxtension/derived-async'

@Injectable()
export class XpertExecutionService {
  readonly conversationService = inject(ChatConversationService)

  readonly conversationId = signal<string>(null)
  readonly #conversation = derivedAsync(() => {
    return this.conversationId()
      ? this.conversationService.getById(this.conversationId(), { relations: ['execution', 'execution.subExecutions'] })
      : null
  })

  readonly conversation = computed(() => this.#conversation())

  readonly #messages = signal<CopilotChatMessage[]>([])

  readonly messages = computed(() => {
    if (this.#conversation()) {
        return [...this.#conversation().messages, ...this.#messages()]
    }
    return this.#messages()
  })

  // readonly execution = signal<IXpertAgentExecution>(null)
  readonly #agentExecutions = signal<Record<string, IXpertAgentExecution>>({})
  readonly agentExecutions = computed(() => {
    const agentExecutions = {}
    Object.values(this.#agentExecutions() ?? {}).forEach((execution) => {
      execution.subExecutions?.forEach((item) => {
        if (item.agentKey) {
          agentExecutions[item.agentKey] = item
        }
      })
      if (execution.agentKey) {
        agentExecutions[execution.agentKey] = execution
      }
    })

    Object.keys(this.knowledgeExecutions() ?? {}).forEach((id) => {
      agentExecutions[id] = this.knowledgeExecutions()[id]
    })

    return agentExecutions
  })

  readonly toolExecutions = signal<Record<string, {status: XpertAgentExecutionEnum}>>({})
  readonly knowledgeExecutions = signal<Record<string, {status: XpertAgentExecutionEnum}>>({})

  constructor() {
    effect(() => {
      const execution = this.#conversation()?.execution
      if (execution) {
        this.#agentExecutions.set({[execution.agentKey]: execution})
      }
    }, { allowSignalWrites: true })
  }

  appendMessage(message: CopilotChatMessage) {
    this.#messages.update(
      (state) =>[...(state ?? []), message]
    )
  }

  setAgentExecution(key: string, execution: IXpertAgentExecution) {
    this.#agentExecutions.update((state) => ({
      ...state,
      [key]: execution
    }))
  }

  setConversation(value: IChatConversation) {
    this.conversationId.set(value?.id)
    this.#agentExecutions.set({})
    this.#messages.set([])
  }

  setToolExecution(name: string, execution) {
    this.toolExecutions.update((state) => ({
      ...state,
      [name]: execution
    }))
  }

  setKnowledgeExecution(name: string, execution: { status: XpertAgentExecutionEnum }) {
    this.knowledgeExecutions.update((state) => ({
      ...state,
      [name]: execution
    }))
  }

  clear() {
    this.#agentExecutions.set({})
    this.toolExecutions.set({})
    this.knowledgeExecutions.set({})
  }
}
