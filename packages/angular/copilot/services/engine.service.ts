import { Injectable, computed, inject, signal } from '@angular/core'
import {
  AIOptions,
  AnnotatedFunction,
  CopilotChatMessage,
  CopilotChatMessageRoleEnum,
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
import { pick } from 'lodash-es'
import { NGXLogger } from 'ngx-logger'
import { Observable, from, map, throwError } from 'rxjs'

let uniqueId = 0

@Injectable()
export class NgmCopilotEngineService implements CopilotEngine {
  readonly #logger? = inject(NGXLogger, { optional: true })
  readonly copilot = inject(CopilotService)

  private api = signal('/api/chat')
  private chatId = `chat-${uniqueId++}`
  private key = computed(() => `${this.api()}|${this.chatId}`)

  aiOptions: AIOptions = {
    model: DefaultModel
  } as AIOptions

  readonly conversations$ = signal<CopilotChatMessage[]>([])
  get conversations() {
    return this.conversations$()
  }

  readonly messages = computed(() => this.conversations$())

  /**
   * Calculate messages in the last conversation
   */
  readonly lastConversation = computed(() => {
    const conversations = this.conversations$()
    // Get last conversation messages
    const lastMessages = []
    let lastUserMessage = null
    for (let i = conversations.length - 1; i >= 0; i--) {
      if (conversations[i].end) {
        break
      }
      if (conversations[i].role === CopilotChatMessageRoleEnum.User) {
        if (lastUserMessage) {
          lastUserMessage.content = conversations[i].content + '\n' + lastUserMessage.content
        } else {
          lastUserMessage = {
            role: CopilotChatMessageRoleEnum.User,
            content: conversations[i].content
          }
        }
      } else if (conversations[i].role !== CopilotChatMessageRoleEnum.Info) {
        if (lastUserMessage) {
          lastMessages.push(lastUserMessage)
          lastUserMessage = null
        }
        lastMessages.push(conversations[i])
      }
    }
    if (lastUserMessage) {
      lastMessages.push(lastUserMessage)
    }
    return lastMessages.reverse()
  })

  readonly lastUserMessages = computed(() => {
    const conversations = this.conversations$()
    const messages = []
    for (let i = conversations.length - 1; i >= 0; i--) {
      if (conversations[i].role === CopilotChatMessageRoleEnum.User && !conversations[i].command) {
        messages.push({
          id: conversations[i].id,
          role: conversations[i].role,
          content: conversations[i].content
        })
      } else {
        break
      }
    }
    return messages
  })

  placeholder?: string

  // Entry Points
  readonly #entryPoints = signal<Record<string, AnnotatedFunction<any[]>>>({})

  readonly getFunctionCallHandler = computed(() => {
    return entryPointsToFunctionCallHandler(Object.values(this.#entryPoints()))
  })
  readonly getChatCompletionFunctionDescriptions = computed(() => {
    return entryPointsToChatCompletionFunctions(Object.values(this.#entryPoints()))
  })

  // Commands
  readonly #commands = signal<Record<string, CopilotCommand>>({})
  readonly commands = computed(() => Object.values(this.#commands()))

  // Chat States
  error = signal<undefined | Error>(undefined)
  streamData = signal<JSONValue[] | undefined>(undefined)
  isLoading = signal(false)

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

  process(
    data: { prompt: string; newConversation?: boolean; messages?: CopilotChatMessage[] },
    options?: { action?: string }
  ): Observable<string | CopilotChatMessage | void> {
    this.#logger?.debug(`process ask: ${data.prompt}`)

    // New messages
    const newMessages: CopilotChatMessage[] = []
    const { command, prompt } = getCommandPrompt(data.prompt)
    if (command) {
      const _command = this.getCommand(command)

      if (!_command) {
        return throwError(() => new Error(`Command '${command}' not found`))
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
      this.conversations$.update((state) => [...state, ...newMessages])

      // Exec command implementation
      if (_command.implementation) {
        return from(_command.implementation())
      }

      const functions = _command.actions
        ? entryPointsToChatCompletionFunctions(_command.actions.map((id) => this.#entryPoints()[id]))
        : this.getChatCompletionFunctionDescriptions()

      const body = {
        ...this.aiOptions
      }
      if (functions.length) {
        body.functions = functions
      }

      return from(
        this.triggerRequest([...lastUserMessages, ...newMessages], {
          options: {
            body
          }
        })
      ).pipe(map(() => ''))
    } else {
      // Last conversation messages before append new messages
      const lastConversation = this.lastConversation()
      newMessages.push({
        id: nanoid(),
        role: CopilotChatMessageRoleEnum.User,
        content: prompt
      })
      // Append new messages to conversation
      this.conversations$.update((state) => [...state, ...newMessages])

      const functions = this.getChatCompletionFunctionDescriptions()
      const body = {
        ...this.aiOptions
      }
      if (functions.length) {
        body.functions = functions
      }

      return from(
        this.triggerRequest([...lastConversation, ...newMessages], {
          options: {
            body
          }
        })
      ).pipe(map(() => ''))
    }
  }

  // useChat
  async triggerRequest(
    messagesSnapshot: CopilotChatMessage[],
    { options, data }: ChatRequestOptions = {}
  ): Promise<ChatRequest | null | undefined> {
    let abortController = null
    try {
      this.error.set(undefined)
      this.isLoading.set(true)
      abortController = new AbortController()

      const getCurrentMessages = () => this.lastConversation() ?? []
      // chatApiStore.get([this.key()], {
      //   shouldRevalidate: false,
      // })

      // Do an optimistic update to the chat state to show the updated messages
      // immediately.
      // const previousMessages = getCurrentMessages()
      // this.mutate(messagesSnapshot)

      let chatRequest: ChatRequest = {
        messages: messagesSnapshot as Message[],
        options,
        data
      }

      const message = await processChatStream({
        getStreamedResponse: async () => {
          // const existingData = this.streamData() ?? []
          try {
            return await this.copilot.chat(
              {
                body: {
                  // functions: this.getChatCompletionFunctionDescriptions(),
                  ...pick(this.aiOptions, 'model', 'temperature'),
                  ...(options?.body ?? {})
                },
                onFinish: (message) => {
                  this.upsertMessage(message)
                },
                appendMessage: (message) => {
                  this.upsertMessage(message)
                }
              },
              chatRequest,
              { options, data },
              abortController
            )
          } catch (err: any) {
            this.conversations$.update((state) => {
              return [
                ...state,
                {
                  id: nanoid(),
                  role: CopilotChatMessageRoleEnum.Assistant,
                  content: '',
                  error: err.message
                }
              ]
            })
            throw err
          }
        },
        experimental_onFunctionCall: this.getFunctionCallHandler(),
        updateChatRequest: (newChatRequest) => {
          chatRequest = newChatRequest
          this.#logger?.debug(`The new chat request after FunctionCall is`, newChatRequest)

          // Update or append message into conversation
          // this.conversations$.update((state) => {
          //   const messages = [...state]
          //   newChatRequest.messages.forEach((message) => {
          //     const index = messages.findIndex((item) => item.id && item.id === message.id)
          //     if (index > -1) {
          //       messages[index] = message
          //     } else {
          //       messages.push(message)
          //     }
          //   })
          //   return messages
          // })
        },
        getCurrentMessages: () => getCurrentMessages()
      })
      abortController = null

      if (message) {
        this.conversations$.update((state) => [...state, message])
      }
      return null
    } catch (err) {
      // Ignore abort errors as they are expected.
      if ((err as any).name === 'AbortError') {
        abortController = null
        return null
      }

      if (err instanceof Error) {
        this.error.set(err)
      }

      this.error.set(err as Error)
      return null
    } finally {
      this.isLoading.set(false)
    }
  }

  async append(message: Message, options: ChatRequestOptions): Promise<ChatRequest | null | undefined> {
    if (!message.id) {
      message.id = this.generateId()
    }
    return this.triggerRequest((this.lastConversation() ?? []).concat(message as Message), options)
  }

  generateId() {
    return nanoid()
  }

  upsertMessage(message: CopilotChatMessage) {
    this.conversations$.update((conversations) => {
      const index = conversations.findIndex((item) => item.id === message.id)
      if (index > -1) {
        conversations[index] = { ...message }
      } else {
        conversations.push(message)
      }
      return [...conversations]
    })
  }

  deleteMessage(message: CopilotChatMessage) {
    this.conversations$.update((conversations) => {
      const index = conversations.findIndex((item) => item.id === message.id)
      if (index) {
        conversations.splice(index, 1)
      }
      return [...conversations]
    })
  }

  clear() {
    this.conversations$.set([])
  }

  updateConversations(fn: (conversations: CopilotChatMessage[]) => CopilotChatMessage[]): void {
    this.conversations$.update(fn)
  }
}
