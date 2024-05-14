import { CdkDragDrop } from '@angular/cdk/drag-drop'
import { Injectable, computed, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import {
  AIOptions,
  CopilotAgentType,
  CopilotChatConversation,
  CopilotChatMessage,
  CopilotChatMessageRoleEnum,
  CopilotChatOptions,
  CopilotCommand,
  CopilotEngine,
  CopilotService,
  DefaultModel,
  entryPointsToChatCompletionFunctions,
  getCommandPrompt,
  processChatStream
} from '@metad/copilot'
import { compact } from '@metad/ocap-core'
import { ChatRequest, ChatRequestOptions, JSONValue, Message, nanoid } from 'ai'
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents'
import { flatten, pick } from 'lodash-es'
import { NGXLogger } from 'ngx-logger'
import { DropAction } from '../types'
import { NgmCopilotContextToken, recognizeContext, recognizeContextParams } from './context.service'

let uniqueId = 0

@Injectable()
export class NgmCopilotEngineService implements CopilotEngine {
  readonly #logger? = inject(NGXLogger, { optional: true })
  readonly copilot = inject(CopilotService)
  readonly copilotContext = inject(NgmCopilotContextToken)

  private api = signal('/api/chat')
  private chatId = `chat-${uniqueId++}`
  private key = computed(() => `${this.api()}|${this.chatId}`)

  placeholder?: string

  aiOptions = {} as AIOptions

  readonly #aiOptions = signal<AIOptions>({
    model: DefaultModel
  } as AIOptions)

  readonly verbose = computed(() => this.#aiOptions().verbose)

  readonly llm = toSignal(this.copilot.llm$)

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
    const conversation = this.conversations$()[this.conversations$().length - 1]
    const messages = []
    if (!conversation) {
      return messages
    }
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

  readonly commands = computed(() => this.copilotContext.commands())

  readonly #dropActions = signal<Record<string, DropAction>>({})

  // Chat States
  readonly error = signal<undefined | Error>(undefined)
  readonly streamData = signal<JSONValue[] | undefined>(undefined)
  readonly isLoading = signal(false)

  constructor() {
    //   effect(() => {
    //     console.log('conversations:', this.conversations$())
    //     console.log('last conversation:', this.lastConversation())
    //     console.log('last user messages:', this.lastUserMessages())
    //   })
  }

  updateAiOptions(options?: Partial<AIOptions>) {
    this.#aiOptions.update((state) => ({ ...state, ...options }))
    this.aiOptions = this.#aiOptions()
  }

  /**
   * Find command by name or alias
   *
   * @param name Name or alias of command
   * @returns AI Command
   */
  getCommand(name: string) {
    return this.copilotContext.getCommand(name)
  }

  getCommandWithContext(name: string) {
    return this.copilotContext.getCommandWithContext(name)
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

    const commandWithContext = this.getCommandWithContext(command)
    if (command && !commandWithContext?.command) {
      prompt = `/${command} ${prompt}`
      this.#logger?.warn(`Copilot command '${command}' is not found`)
    }
    if (command && commandWithContext?.command) {
      this.upsertConversation('command')
      // Last user messages before add new messages
      const lastUserMessages = this.lastUserMessages()
      const _command = commandWithContext.command

      // Exec command implementation
      if (_command.implementation) {
        return await _command.implementation()
      }

      // For agent command
      if (_command.agent) {
        return await this.triggerCommandAgent(prompt, _command, {
          conversationId: assistantMessageId,
          context: commandWithContext.context
        })
      }

      try {
        if (_command.systemPrompt) {
          newMessages.push({
            id: nanoid(),
            role: CopilotChatMessageRoleEnum.System,
            content: await _command.systemPrompt()
          })
        }
        newMessages.push({
          id: nanoid(),
          role: CopilotChatMessageRoleEnum.User,
          content: prompt,
          command
        })
      } catch (err: any) {
        newMessages.push({
          id: nanoid(),
          role: CopilotChatMessageRoleEnum.User,
          content: prompt,
          command,
          error: err.message
        })
        return
      } finally {
        // Append new messages to conversation
        this.upsertMessage(...newMessages)
      }

      const functions = _command.actions
        ? entryPointsToChatCompletionFunctions(_command.actions.map((id) => this.copilotContext.getEntryPoint(id)))
        : this.copilotContext.getChatCompletionFunctionDescriptions()

      const body = {
        ...this.aiOptions
      }
      if (functions.length) {
        ;(body.functions = functions), (body.stream = false)
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

      // // New conversation after command completion
      // this.newConversation()
    } else {
      this.upsertConversation('free')
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

      const functions = this.copilotContext.getGlobalFunctionDescriptions()
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

  async triggerCommandAgent(content: string, command: CopilotCommand, options?: CopilotChatOptions) {
    let { conversationId, abortController, context } = options ?? {}
    conversationId ??= nanoid()
    abortController ??= new AbortController()

    // Context content
    const contextContent = context ? await recognizeContext(content, context) : null
    const params = await recognizeContextParams(content, context)

    const messages = []
    let systemPrompt = ''
    try {
      // Get System prompt
      if (command.systemPrompt) {
        systemPrompt = await command.systemPrompt({params})
      }

      messages.push({
        id: nanoid(),
        role: CopilotChatMessageRoleEnum.User,
        content: content,
        command: command.name
      })
    } catch (err: any) {
      messages.push({
        id: nanoid(),
        role: CopilotChatMessageRoleEnum.User,
        content: content,
        command: command.name,
        error: err.message
      })
      return
    } finally {
      this.upsertMessage(...messages)
    }

    const assistantId = conversationId ?? nanoid()
    this.upsertMessage({
      id: assistantId,
      role: CopilotChatMessageRoleEnum.Assistant,
      content: '',
      status: 'thinking'
    })
    // Remove thinking message when abort
    const removeMessageWhenAbort = () => {
      this.stopMessage(assistantId)
    }
    abortController.signal.addEventListener('abort', removeMessageWhenAbort)

    try {
      let agentExecutor = null
      const llm = this.llm()
      const verbose = this.verbose()
      if (llm) {
        if (command.agent.type === CopilotAgentType.Default) {
          const agent = await createOpenAIToolsAgent({
            llm,
            tools: command.tools,
            prompt: command.prompt
          })
          agentExecutor = new AgentExecutor({
            agent,
            tools: command.tools as any[],
            verbose
          })
        } else {
          throw new Error(`Agent type '${command.agent.type}' is not supported`)
        }
      } else {
        throw new Error('LLM is not available')
      }

      const result = await agentExecutor.invoke({ input: content, system_prompt: systemPrompt, context: contextContent })

      this.#logger?.debug(`Agent command '${command.name}' result:`, result)

      this.upsertMessage({
        id: assistantId,
        role: CopilotChatMessageRoleEnum.Assistant,
        content: result['output'],
        status: 'done'
      })
      return null
    } catch (err: any) {
      this.upsertMessage({
        id: assistantId,
        role: CopilotChatMessageRoleEnum.Assistant,
        content: '',
        status: 'error',
        error: err.message
      })
      return
    } finally {
      abortController.signal.removeEventListener('abort', removeMessageWhenAbort)
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
      data
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
      this.stopMessage(thinkingMessage.id)
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
            { options, data }
          )
        },
        experimental_onFunctionCall: this.copilotContext.getFunctionCallHandler(),
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

  newConversation(type: CopilotChatConversation['type']) {
    const conversation = this.#newConversation(type)
    this.#conversationId.set(conversation.id)
    this.conversations$.update((conversations) => [...conversations, conversation])
  }

  #newConversation(type: CopilotChatConversation['type']): CopilotChatConversation {
    return {
      id: nanoid(),
      messages: [],
      type
    }
  }

  upsertConversation(type: CopilotChatConversation['type']) {
    const conversations = this.conversations$()
    const lastConversation = conversations[conversations.length - 1]
    if (lastConversation?.type) {
      // Don't create new conversation only if two types are the same 'free'
      if (!(type === 'free' && lastConversation.type === 'free')) {
        this.newConversation(type)
      }
    } else {
      this.updateLastConversation((conversation) => ({
        ...(conversation ?? this.#newConversation(type)),
        type
      }))
    }
  }

  upsertMessage(...messages: CopilotChatMessage[]) {
    this.conversations$.update((conversations) => {
      const lastConversation = conversations[conversations.length - 1]
      const lastMessages = lastConversation.messages
      messages.forEach((message) => {
        const index = lastMessages.findIndex((item) => item.id === message.id)
        if (index > -1) {
          lastMessages[index] = { ...message }
        } else {
          lastMessages.push(message)
        }
      })
      return [
        ...conversations.slice(0, conversations.length - 1),
        {
          ...lastConversation,
          messages: lastMessages
        }
      ]
    })
  }

  deleteMessage(message: CopilotChatMessage | string) {
    const messageId = typeof message === 'string' ? message : message.id
    this.conversations$.update((conversations) =>
      conversations.map((conversation) => ({
        ...conversation,
        messages: conversation.messages.filter((item) => item.id !== messageId)
      }))
    )
  }

  clear() {
    this.conversations$.set([])
  }

  updateConversations(fn: (conversations: Array<CopilotChatConversation>) => Array<CopilotChatConversation>): void {
    this.conversations$.update(fn)
  }

  updateConversation(id: string, fn: (conversation: CopilotChatConversation) => CopilotChatConversation): void {
    this.conversations$.update((conversations) => {
      const index = conversations.findIndex((conversation) => conversation.id === id)
      if (index > -1) {
        conversations[index] = fn(conversations[index])
      }
      return compact(conversations)
    })
  }

  updateLastConversation(fn: (conversations: CopilotChatConversation) => CopilotChatConversation): void {
    this.conversations$.update((conversations) => {
      const lastIndex = conversations.length - 1 < 0 ? 0 : conversations.length - 1
      const lastConversation = conversations[lastIndex]
      conversations[lastIndex] = fn(lastConversation)
      return compact(conversations)
    })
  }

  stopMessage(id: string) {
    this.updateLastConversation((conversation) => {
      const message = conversation.messages.find((m) => m.id === id)
      if (message) {
        message.status = 'done'
      }
      return conversation
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
