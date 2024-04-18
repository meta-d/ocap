import { CdkDragDrop } from '@angular/cdk/drag-drop'
import { Injectable, computed, inject, signal } from '@angular/core'
import {
  AIOptions,
  AnnotatedFunction,
  CopilotChatConversation,
  CopilotChatMessage,
  CopilotChatMessageRoleEnum,
  CopilotChatOptions,
  CopilotCommand,
  CopilotEngine,
  CopilotService,
  DefaultModel,
  entryPointsToChatCompletionFunctions,
  entryPointsToFunctionCallHandler,
  getCommandPrompt,
  processChatStream
} from '@metad/copilot'
import { ChatRequest, ChatRequestOptions, JSONValue, Message, nanoid } from 'ai'
import { flatten, pick } from 'lodash-es'
import { NGXLogger } from 'ngx-logger'
import { DropAction } from '../types'

let uniqueId = 0

@Injectable()
export class NgmCopilotEngineService implements CopilotEngine {
  readonly #logger? = inject(NGXLogger, { optional: true })
  readonly copilot = inject(CopilotService)

  private api = signal('/api/chat')
  private chatId = `chat-${uniqueId++}`
  private key = computed(() => `${this.api()}|${this.chatId}`)

  placeholder?: string

  aiOptions: AIOptions = {
    model: DefaultModel
  } as AIOptions

  /**
   * One conversation including user and assistant messages
   * This is a array of conversations
   */
  readonly conversations$ = signal<Array<CopilotChatConversation>>([])
  readonly #conversationId = signal<string>(nanoid())

  readonly conversations = computed(() => this.conversations$())
  readonly messages = computed(() => flatten(this.conversations$().map((c) => c.messages)))

  readonly lastConversation = computed(() => {
    const conversation = this.conversations$()[this.conversations$().length - 1] ?? { messages: [] }
    
    // Get last conversation messages
    const lastMessages = []
    let lastUserMessage = null
    for (let i = conversation.messages.length - 1; i >= 0; i--) {
      const message = conversation.messages[i]
      if (message.role === CopilotChatMessageRoleEnum.User) {
        if (lastUserMessage) {
          lastUserMessage.content = message.content + '\n' + lastUserMessage.content
        } else {
          lastUserMessage = {
            role: CopilotChatMessageRoleEnum.User,
            content: message.content
          }
        }
      } else if (message.role !== CopilotChatMessageRoleEnum.Info) {
        if (lastUserMessage) {
          lastMessages.push(lastUserMessage)
          lastUserMessage = null
        }
        lastMessages.push(message)
      }
    }
    if (lastUserMessage) {
      lastMessages.push(lastUserMessage)
    }
    return {
      ...conversation,
      messages: lastMessages.reverse()
    }
  })

  readonly lastUserMessages = computed(() => {
    const conversation = this.conversations$()[this.conversations$().length - 1] ?? { messages: [] }
    const messages = []
    for (let i = conversation.messages.length - 1; i >= 0; i--) {
      const message = conversation.messages[i]
      if (message.role === CopilotChatMessageRoleEnum.User && !message.command) {
        messages.push({
          id: message.id,
          role: message.role,
          content: message.content
        })
      } else {
        break
      }
    }
    return messages
  })

  // Entry Points
  readonly #entryPoints = signal<Record<string, AnnotatedFunction<any[]>>>({})

  readonly getFunctionCallHandler = computed(() => {
    return entryPointsToFunctionCallHandler(Object.values(this.#entryPoints()))
  })
  readonly getChatCompletionFunctionDescriptions = computed(() => {
    return entryPointsToChatCompletionFunctions(Object.values(this.#entryPoints()))
  })
  readonly getGlobalFunctionDescriptions = computed(() => {
    const ids = Object.keys(this.#entryPoints()).filter((id) => !Object.values(this.#commands()).some((command) => command.actions?.includes(id)))
    return entryPointsToChatCompletionFunctions(ids.map((id) => this.#entryPoints()[id]))
  })

  // Commands
  readonly #commands = signal<Record<string, CopilotCommand>>({})
  readonly commands = computed(() => Object.values(this.#commands()))

  readonly #dropActions = signal<Record<string, DropAction>>({})

  // Chat States
  readonly error = signal<undefined | Error>(undefined)
  readonly streamData = signal<JSONValue[] | undefined>(undefined)
  readonly isLoading = signal(false)

  // constructor() {
  //   effect(() => {
  //     console.log('conversations:', this.conversations$())
  //     console.log('last conversation:', this.lastConversation())
  //     console.log('last user messages:', this.lastUserMessages())
  //   })
  // }

  setEntryPoint(id: string, entryPoint: AnnotatedFunction<any[]>) {
    this.#entryPoints.update((state) => ({
      ...state,
      [id]: entryPoint
    }))
  }

  removeEntryPoint(id: string) {
    this.#entryPoints.update((prevPoints) => {
      const newPoints = { ...prevPoints }
      delete newPoints[id]
      return newPoints
    })
  }

  registerCommand(name: string, command: CopilotCommand) {
    this.#commands.update((state) => ({
      ...state,
      [name]: command
    }))
  }

  unregisterCommand(name: string) {
    this.#commands.update((state) => {
      delete state[name]
      return {
        ...state
      }
    })
  }

  getCommand(name: string) {
    return this.#commands()[name]
  }

  registerDropAction(dropAction: DropAction) {
    this.#dropActions.update((state) => ({
      ...state,
      [dropAction.id]: dropAction
    }))
  }
  unregisterDropAction(id: string) {
    this.#dropActions.update((state) => {
      delete state[id]
      return {
        ...state
      }
    })
  }

  async chat(prompt: string, options?: CopilotChatOptions) {
    this.#logger?.debug(`process copilot ask: ${prompt}`)

    let { command } = options ?? {}
    const { abortController, assistantMessageId, conversationId } = options ?? {}
    // New messages
    const newMessages: CopilotChatMessage[] = []

    // deconstruct prompt to get command and prompt
    if (!command && prompt) {
      const data = getCommandPrompt(prompt)
      command = data.command
      prompt = data.prompt
    }
    
    if (command) {
      const _command = this.getCommand(command)

      if (!_command) {
        throw new Error(`Command '${command}' not found`)
      }

      if (_command.systemPrompt) {
        newMessages.push({
          id: nanoid(),
          role: CopilotChatMessageRoleEnum.System,
          content: _command.systemPrompt()
        })
      }
      newMessages.push({
        id: nanoid(),
        role: CopilotChatMessageRoleEnum.User,
        content: prompt,
        command
      })

      // Last user messages before add new messages
      const lastUserMessages = this.lastUserMessages()
      // Append new messages to conversation
      this.upsertMessage(...newMessages)

      // Exec command implementation
      if (_command.implementation) {
        return await _command.implementation()
      }

      const functions = _command.actions
        ? entryPointsToChatCompletionFunctions(_command.actions.map((id) => this.#entryPoints()[id]))
        : this.getChatCompletionFunctionDescriptions()

      const body = {
        ...this.aiOptions
      }
      if (functions.length) {
        body.functions = functions,
        body.stream = false
      }

      await this.triggerRequest(
        [...lastUserMessages, ...newMessages],
        {
          options: {
            body
          }
        },
        {
          abortController,
          assistantMessageId,
          conversationId: conversationId ?? this.#conversationId()
        }
      )

      // New conversation after command completion
      this.newConversation()
    } else {
      // Last conversation messages before append new messages
      const lastConversation = this.lastConversation()
      // Allow empty prompt
      if (prompt) {
        newMessages.push({
          id: nanoid(),
          role: CopilotChatMessageRoleEnum.User,
          content: prompt
        })
      }

      // Append new messages to conversation
      if (newMessages.length > 0) {
        this.upsertMessage(...newMessages)
      }

      const functions = this.getGlobalFunctionDescriptions()
      const body = {
        ...this.aiOptions
      }
      if (functions.length) {
        body.functions = functions
      }

      await this.triggerRequest(
        [...lastConversation.messages, ...newMessages],
        {
          options: {
            body
          }
        },
        {
          abortController,
          assistantMessageId,
          conversationId
        }
      )
    }
  }

  // useChat
  async triggerRequest(
    messagesSnapshot: CopilotChatMessage[],
    { options, data }: ChatRequestOptions = {},
    {
      abortController,
      assistantMessageId,
      conversationId
    }: {
      abortController?: AbortController | null
      assistantMessageId?: string
      conversationId?: string
    } = {}
  ): Promise<ChatRequest | null | undefined> {
    this.error.set(undefined)
    this.isLoading.set(true)
    abortController = abortController ?? new AbortController()
    const getCurrentMessages = () => this.lastConversation()?.messages ?? []

    let chatRequest: ChatRequest = {
      messages: messagesSnapshot as Message[],
      options,
      data,
    }

    assistantMessageId = assistantMessageId ?? nanoid()
    const thinkingMessage: CopilotChatMessage = {
      id: assistantMessageId,
      role: CopilotChatMessageRoleEnum.Assistant,
      content: '',
      status: 'thinking'
    }

    this.upsertMessage(thinkingMessage)

    // Remove thinking message when abort
    const removeMessageWhenAbort = () => {
      this.deleteMessage(thinkingMessage)
    }
    abortController.signal.addEventListener('abort', removeMessageWhenAbort)

    try {
      const message = await processChatStream({
        getStreamedResponse: async () => {
          return await this.copilot.chat(
            {
              body: {
                // functions: this.getChatCompletionFunctionDescriptions(),
                ...pick(this.aiOptions, 'temperature'),
                ...(options?.body ?? {})
              },
              generateId: () => assistantMessageId,
              // onResponse: async (): Promise<void> => {
              //   this.deleteMessage(thinkingMessage)
              // },
              onFinish: (message) => {
                this.upsertMessage({ ...message, status: 'answering' })
              },
              appendMessage: (message) => {
                this.upsertMessage({ ...message, status: 'answering' })
              },
              abortController,
              model: this.aiOptions.model
            },
            chatRequest,
            { options, data },
          )
        },
        experimental_onFunctionCall: this.getFunctionCallHandler(),
        updateChatRequest: (newChatRequest) => {
          chatRequest = newChatRequest
          this.#logger?.debug(`The new chat request after FunctionCall is`, newChatRequest)
        },
        getCurrentMessages: () => getCurrentMessages(),
        conversationId
      })
      // abortController = null

      if (message) {
        this.upsertMessage({ ...message, id: assistantMessageId, status: 'done' })
      } else {
        this.deleteMessage(assistantMessageId)
      }
      return null
    } catch (err) {
      // Ignore abort errors as they are expected.
      if ((err as any).name === 'AbortError') {
        // abortController = null
        return null
      }

      if (err instanceof Error) {
        this.error.set(err)
        this.deleteMessage(assistantMessageId)
        this.upsertMessage({
          id: nanoid(),
          role: CopilotChatMessageRoleEnum.Assistant,
          content: '',
          error: (<Error>err).message,
          status: 'error'
        })
      }

      return null
    } finally {
      abortController.signal.removeEventListener('abort', removeMessageWhenAbort)
      this.isLoading.set(false)
    }
  }

  async append(message: Message, options: ChatRequestOptions): Promise<ChatRequest | null | undefined> {
    if (!message.id) {
      message.id = this.generateId()
    }
    return this.triggerRequest((this.lastConversation()?.messages ?? []).concat(message as Message), options)
  }

  generateId() {
    return nanoid()
  }

  newConversation() {
    const conversation = this.#newConversation()
    this.#conversationId.set(conversation.id)
    this.conversations$.update((conversations) => [...conversations, conversation])
  }

  #newConversation() {
    return {
      id: nanoid(),
      messages: []
    }
  }

  upsertMessage(...messages: CopilotChatMessage[]) {
    this.conversations$.update((conversations) => {
      const lastConversation = conversations[conversations.length - 1] ?? this.#newConversation()
      const lastMessages = lastConversation.messages
      messages.forEach((message) => {
        const index = lastMessages.findIndex((item) => item.id === message.id)
        if (index > -1) {
          lastMessages[index] = { ...message }
        } else {
          lastMessages.push(message)
        }
      })
      return [...conversations.slice(0, conversations.length - 1), {
        ...lastConversation,
        messages: lastMessages
      }]
    })
  }

  deleteMessage(message: CopilotChatMessage | string) {
    const messageId = typeof message === 'string' ? message : message.id
    this.conversations$.update((conversations) => conversations.map((conversation) => ({
      ...conversation,
      messages: conversation.messages.filter((item) => item.id !== messageId)
    })))
  }

  clear() {
    this.conversations$.set([])
  }

  updateConversations(fn: (conversations: Array<CopilotChatConversation>) => Array<CopilotChatConversation>): void {
    this.conversations$.update(fn)
  }

  updateLastConversation(fn: (conversations: CopilotChatConversation) => CopilotChatConversation): void {
    this.conversations$.update((conversations) => {
      const lastIndex = conversations[conversations.length - 1]?.messages.length ? conversations.length - 1 : conversations.length - 2
      const lastConversation = conversations[lastIndex] ?? this.#newConversation()
      conversations[lastIndex] = fn(lastConversation)
      if (!conversations[lastIndex]) {
        conversations.splice(lastIndex, 1)
      }
      return [...conversations]
    })
  }

  async dropCopilot(event: CdkDragDrop<any[], any[], any>) {
    const dropActions = this.#dropActions()
    if (dropActions[event.previousContainer.id]) {
      const message = await dropActions[event.previousContainer.id].implementation(event, this)
      this.upsertMessage(message)
    }
  }
}
