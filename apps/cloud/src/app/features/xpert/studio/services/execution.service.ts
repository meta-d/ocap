import { computed, effect, inject, Injectable, signal } from '@angular/core'
import {
  ChatConversationService,
  CopilotChatMessage,
  IChatConversation,
  IXpertAgentExecution,
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

  readonly execution = signal<IXpertAgentExecution>(null)
  readonly #agentExecutions = signal<Record<string, IXpertAgentExecution>>({})
  readonly agentExecutions = computed(() => {
    const execution = this.execution()
    if (!execution) {
      return this.#agentExecutions()
    }
    const agentExecutions = {}
    if (execution) {
      execution.subExecutions?.forEach((item) => {
        if (item.agentKey) {
          agentExecutions[item.agentKey] = item
        }
      })
      if (execution.agentKey) {
        agentExecutions[execution.agentKey] = execution
      }
    }
    return agentExecutions
  })

  constructor() {
    effect(() => {
      this.execution.set(this.#conversation()?.execution)
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

}
