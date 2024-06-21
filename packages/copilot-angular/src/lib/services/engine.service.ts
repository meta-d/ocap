import { CdkDragDrop } from '@angular/cdk/drag-drop'
import { Injectable, computed, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { Runnable } from '@langchain/core/runnables'
import {
  AIOptions,
  CopilotAgentType,
  CopilotChatConversation,
  CopilotChatMessage,
  CopilotChatMessageRoleEnum,
  CopilotChatOptions,
  CopilotCommand,
  CopilotContext,
  CopilotEngine,
  DefaultModel,
  entryPointsToChatCompletionFunctions,
  getCommandPrompt,
  processChatStream
} from '@metad/copilot'
import { BaseCheckpointSaver, END, GraphValueError } from '@langchain/langgraph/web'
import { ChatRequest, ChatRequestOptions, JSONValue, Message, nanoid } from 'ai'
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents'
import { compact, flatten, pick } from 'lodash-es'
import { NGXLogger } from 'ngx-logger'
import { DropAction, NgmCopilotChatMessage } from '../types'
import { NgmCopilotContextToken, recognizeContext, recognizeContextParams } from './context.service'
import { NgmCopilotService } from './copilot.service'


let uniqueId = 0

@Injectable()
export class NgmCopilotEngineService implements CopilotEngine {
  readonly #logger? = inject(NGXLogger, { optional: true })
  readonly copilot = inject(NgmCopilotService)
  readonly copilotContext = inject(NgmCopilotContextToken)
  readonly checkpointSaver = inject(BaseCheckpointSaver)

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
    const conversation =
      this.conversations$()[this.conversations$().length - 1] ??
      ({ messages: [], command: null } as CopilotChatConversation)

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
    const messages: BaseMessage[] = []
    if (!conversation) {
      return messages
    }
    for (let i = conversation.messages.length - 1; i >= 0; i--) {
      const message = conversation.messages[i]
      if (message.role === CopilotChatMessageRoleEnum.User && !message.command) {
        messages.push(message.lcMessage)
      } else {
        break
      }
    }
    return messages
  })

  readonly currentConversation = computed(() => this.conversations$()[this.conversations$().length - 1])
  readonly currentCommand = computed(() => this.currentConversation()?.command)
  readonly currentConversationId = computed(() => this.currentConversation()?.id)

  readonly chatHistoryMessages = computed(() => {
    const conversation =
      this.conversations$()[this.conversations$().length - 1] ?? ({ messages: [] } as CopilotChatConversation)
    return conversation.messages.map(({ lcMessage }) => lcMessage).filter((m) => !!m)
  })

  readonly commands = computed(() => this.copilotContext.commands())

  readonly #dropActions = signal<Record<string, DropAction>>({})

  // Chat States
  readonly error = signal<undefined | Error>(undefined)
  readonly streamData = signal<JSONValue[] | undefined>(undefined)
  readonly isLoading = signal(false)

  // readonly agentMemory = new MemorySaver()

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

  /**
   * Chat with prompt, split it to command and free chat
   * 
   * @param prompt 
   * @param options 
   * @returns 
   */
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
      this.upsertConversation({
        id: conversationId,
        type: 'command',
        command: commandWithContext.command
      })

      const _command = commandWithContext.command

      // Exec command implementation
      if (_command.implementation) {
        this.upsertMessage({
          id: nanoid(),
          role: CopilotChatMessageRoleEnum.User,
          content: prompt,
          command,
          lcMessage: new HumanMessage({ content: prompt })
        })
        const result = await _command.implementation()
        if (typeof result === 'string') {
          this.upsertMessage({
            id: nanoid(),
            role: CopilotChatMessageRoleEnum.Assistant,
            content: result,
            status: 'done',
            lcMessage: new AIMessage({ content: result })
          })
        }
        return
      } else {
        await this.callCommand(_command, prompt, { ...(options ?? {}), context: commandWithContext.context })
      }

      // // New conversation after command completion
      // this.newConversation()
    } else {
      if (this.currentCommand()?.agent.conversation) {
        const _command = this.currentCommand()
        const commandWithContext = this.getCommandWithContext(_command.name)

        return await this.callCommand(_command, prompt, { ...(options ?? {}), context: commandWithContext.context })
      }

      this.upsertConversation({
        id: conversationId,
        type: 'free',
      })
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

  /**
   * Execute command prompt
   * 
   * @param _command 
   * @param prompt 
   * @param options 
   * @returns 
   */
  async callCommand(_command: CopilotCommand, prompt: string, options: CopilotChatOptions) {
    const { abortController, conversationId, assistantMessageId, context } = options ?? {}

    // For agent command
    if (_command.agent) {
      return await this.triggerCommandAgent(prompt, _command, {
        conversationId: assistantMessageId,
        context: context,
        abortController
      })
    }

    /**
     * @deprecated the ortherwise use agent command instead
     */
    // Last user messages before add new messages
    const lastUserMessages = this.lastUserMessages()
    const newMessages = []
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
        command: _command.name
      })
    } catch (err: any) {
      newMessages.push({
        id: nanoid(),
        role: CopilotChatMessageRoleEnum.User,
        content: prompt,
        command: _command.name,
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
      body.functions = functions
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
  }

  /**
   * Execute agent command
   * 
   * @param content 
   * @param command 
   * @param options 
   * @returns 
   */
  async triggerCommandAgent(content: string, command: CopilotCommand, options?: CopilotChatOptions) {
    const currentConversation = this.currentConversation()
    switch(command.agent.type) {
      case CopilotAgentType.Default:
        return await this.triggerDefaultAgent(content, command, options)
      case CopilotAgentType.Graph:
        return await this.triggerGraphAgent(content, currentConversation, options)
    }
  }

  async triggerDefaultAgent(content: string, command: CopilotCommand, options?: CopilotChatOptions) {
    // ------------------------- 重复，需重构
    let { conversationId, abortController } = options ?? {}
    const { context } = options ?? {}
    // conversationId ??= nanoid()
    abortController ??= new AbortController()

    // Get chat history messages
    const chatHistoryMessages = this.chatHistoryMessages()

    // Context content
    const {systemPrompt, contextContent} = await this.upsertUserInputMessage(command, content, context)

    conversationId ??= this.currentConversationId()
    const assistantId = nanoid()

    this.upsertMessage({
      id: assistantId,
      role: CopilotChatMessageRoleEnum.Assistant,
      content: '',
      status: 'thinking',
      historyCursor: command.historyCursor?.()
    })

    // Remove thinking message when abort
    const removeMessageWhenAbort = () => {
      this.stopMessage(assistantId)
    }
    abortController.signal.addEventListener('abort', removeMessageWhenAbort)
    // ------------------------- 重


    try {
      let chain: Runnable = null
      const llm = this.llm()
      const verbose = this.verbose()
      if (llm) {
        if (!command.prompt) {
          throw new Error(`Prompt should be provided for agent command '${command.name}'`)
        }

        switch (command.agent.type) {
          case CopilotAgentType.Default: {
            const agent = await createOpenAIToolsAgent({
              llm,
              tools: command.tools,
              prompt: command.prompt
            })
            chain = new AgentExecutor({
              agent,
              tools: command.tools,
              verbose
            }) as unknown as Runnable
            break
          }
          case CopilotAgentType.LangChain: {
            chain = command.prompt.pipe(this.llm()).pipe(new StringOutputParser())
            break
          }
          default:
            throw new Error(`Agent type '${command.agent.type}' is not supported`)
        }
      } else {
        throw new Error('LLM is not available')
      }

      // For few shot
      if (command.fewShotPrompt) {
        content = await command.fewShotPrompt.format({ input: content, context: contextContent })
        this.#logger?.debug(`[Command] [${command.name}] few shot input: ${content}`)
      }

      let verboseContent = ''
      const result = await chain.invoke(
        { input: content, system_prompt: systemPrompt, context: contextContent, chat_history: chatHistoryMessages },
        {
          callbacks: [
            {
              handleLLMEnd: async (output) => {
                const text = output.generations[0][0].text
                if (text) {
                  if (verbose) {
                    verboseContent += '\n\n👉 ' + text
                  } else {
                    verboseContent = text
                  }
                  this.upsertMessage({
                    id: assistantId,
                    role: CopilotChatMessageRoleEnum.Assistant,
                    content: verboseContent
                  })
                }
              }
            }
          ]
        }
      )

      this.#logger?.debug(`Agent command '${command.name}' result:`, result)

      this.upsertMessage({
        id: assistantId,
        role: CopilotChatMessageRoleEnum.Assistant,
        content: verboseContent,
        status: 'done',
        lcMessage: new AIMessage({ content: verboseContent })
      })
      return null
    } catch (err: any) {
      console.error(err.message)
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

  async triggerGraphAgent(content: string | null, conversation: CopilotChatConversation, options?: CopilotChatOptions) {
    // ------------------------- 重复，需重构
    let { abortController } = options ?? {}
    const { context } = options ?? {}
    
    abortController ??= new AbortController()

    // Get chat history messages
    // const chatHistoryMessages = this.chatHistoryMessages()
    const lastUserMessages = this.lastUserMessages()

    const command = conversation.command

    // Context content
    let contextContent = null
    if (content) {
      const result = await this.upsertUserInputMessage(command, content, context)
      if (result.error) {
        return
      }
      contextContent = result.contextContent
    }

    let assistantId = nanoid()
    const lastMessage = conversation.messages[conversation.messages.length - 1]
    if (lastMessage.role === CopilotChatMessageRoleEnum.Assistant && lastMessage.status === 'pending') {
      assistantId = lastMessage.id
      this.upsertMessage({
        id: assistantId,
        status: 'thinking',
      })
    } else {
      this.upsertMessage({
        id: assistantId,
        role: CopilotChatMessageRoleEnum.Assistant,
        content: '',
        status: 'thinking',
        historyCursor: command.historyCursor?.()
      })
    }

    // Remove thinking message when abort
    const abort = signal(false)
    const removeMessageWhenAbort = () => {
      this.stopMessage(assistantId)
      abort.set(true)
    }
    abortController.signal.addEventListener('abort', removeMessageWhenAbort)
    // --------------------------

    // Compile state graph
    let graph = conversation.graph
    if (!graph) {
      try {
        const options = {checkpointer: this.checkpointSaver, interruptBefore: null, interruptAfter: null}
        if (this.aiOptions.interactive) {
          options.interruptBefore = command.agent.interruptBefore
          options.interruptAfter = command.agent.interruptAfter
        }
        graph = (await command.createGraph({llm: this.llm(), checkpointer: this.checkpointSaver})).compile(options)

        this.updateLastConversation((conversation) => ({
          ...conversation,
          graph
        }))
      } catch (err: any) {
        console.error(err)
        this.upsertMessage({
          id: assistantId,
          role: CopilotChatMessageRoleEnum.Assistant,
          content: '',
          status: 'error',
          error: err.message
        })
        return
      }
    }
    
    const verbose = this.verbose()
    try {
      const messages = [...lastUserMessages]
      if (content) {
        messages.push(new HumanMessage({ content }))
      }
      const streamResults = await graph.stream(content ?
          {
            messages,
            context: contextContent ? contextContent : null,
            role: this.copilot.rolePrompt()
          } : null,
        {
          configurable: {
            thread_id: this.currentConversationId()
          },
          recursionLimit: 20
        },
      )

      let verboseContent = ''
      let end = false
      try {
        for await (const output of streamResults) {
          if (!output?.__end__) {
            let content = ''
            Object.entries(output).forEach(([key, value]: [string, {messages?: HumanMessage[]; next?: string; instructions?: string;}]) => {
              content += content ? '\n' : ''
              if (value.messages) {
                if (verbose) {
                  content += `<b>${key}</b>: `
                }
                content += value.messages.map((m) => m.content).join('\n\n')
              } else if(value.next) {
                if (value.next === 'FINISH' || value.next === END) {
                  end = true
                } else {
                  content += `<b>${key}</b>: call ${value.next}`
                    + (value.instructions ? ` with: ${value.instructions}` : '')
                }
              }
            })

            if (content) {
              if (verbose) {
                if (verboseContent) {
                  verboseContent += '<br><br>'
                }
                verboseContent += '✨ ' + content
              } else {
                verboseContent = content
              }

              this.upsertMessage({
                id: assistantId,
                role: CopilotChatMessageRoleEnum.Assistant,
                content: verboseContent,
                status: 'thinking',
              })
            }
            if (abort()) {
              break
            }
          }
        }
      } catch (err: any) {
        if (!(err instanceof GraphValueError)) {
          console.error(err)
          this.upsertMessage({
            id: assistantId,
            role: CopilotChatMessageRoleEnum.Assistant,
            status: 'error',
            error: err.message
          })
        }
        end = true
      }

      this.updateConversation(this.currentConversationId(), (conversation) => ({
        ...conversation,
        status: end ? 'completed' : 'interrupted',
      }))

      this.upsertMessage({
        id: assistantId,
        role: CopilotChatMessageRoleEnum.Assistant,
        // content: verboseContent,
        status: end ? 'done' : 'pending',
      })

      return null
    } catch (err: any) {
      console.error(err.message)
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

  async continue(conversation: CopilotChatConversation) {
    await this.triggerGraphAgent(null, conversation)
  }

  private async upsertUserInputMessage(command: CopilotCommand, content: string, context: CopilotContext) {
    const messages: NgmCopilotChatMessage[] = []
    let systemPrompt = ''
    let contextContent = null
    try {

      contextContent = context ? await recognizeContext(content, context) : null
      const params = await recognizeContextParams(content, context)
      if (contextContent) {
        this.updateLastConversation((conversation) => ({
          ...conversation,
          context: contextContent
        }))
      }

      // Get System prompt
      if (command.systemPrompt) {
        systemPrompt = await command.systemPrompt({ params })
      }

      messages.push({
        id: nanoid(),
        role: CopilotChatMessageRoleEnum.User,
        content: content,
        command: command.name,
        lcMessage: new HumanMessage({ content })
      })

      return {systemPrompt, contextContent}
    } catch (err: any) {
      messages.push({
        id: nanoid(),
        role: CopilotChatMessageRoleEnum.User,
        content: content,
        command: command.name,
        error: err.message
      })
      return {systemPrompt, contextContent, error: err}
    } finally {
      this.upsertMessage(...messages)
    }
  }

  /**
   * @deprecated use `triggerCommandAgent` instead
   */
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

  newConversation(value: Partial<CopilotChatConversation>) {
    const conversation = this.#newConversation(value)
    this.#conversationId.set(conversation.id)
    this.conversations$.update((conversations) => [...conversations, conversation])
  }

  #newConversation(value: Partial<CopilotChatConversation>): CopilotChatConversation {
    return {
      ...value,
      id: value.id ?? nanoid(),
      messages: value.messages ?? [],
    } as CopilotChatConversation
  }

  upsertConversation(value: Partial<CopilotChatConversation>) {
    const conversations = this.conversations$()
    const lastConversation = conversations[conversations.length - 1]
    if (lastConversation?.type) {
      // Don't create new conversation only if two types are the same 'free'
      if (!(value.type === 'free' && lastConversation.type === 'free')) {
        this.newConversation(value)
      }
    } else {
      this.updateLastConversation((conversation) => ({
        ...(conversation ?? this.#newConversation(value)),
        ...value,
        id: value.id ?? conversation?.id ?? nanoid()
      }))
    }
  }

  upsertMessage(...messages: Partial<CopilotChatMessage>[]) {
    this.conversations$.update((conversations) => {
      const lastConversation = conversations[conversations.length - 1]
      const lastMessages = lastConversation.messages
      messages.forEach((message) => {
        const index = lastMessages.findIndex((item) => item.id === message.id)
        if (index > -1) {
          lastMessages[index] = { ...lastMessages[index], ...message }
        } else {
          lastMessages.push(message as CopilotChatMessage)
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

  /**
   * Remove message from conversation, then remove the conversation if it has been empty
   *
   * @param message Message or message id
   */
  deleteMessage(message: CopilotChatMessage | string) {
    const messageId = typeof message === 'string' ? message : message.id
    this.conversations$.update((conversations) => {
      const _conversations = []
      conversations.forEach((conversation) => {
        const index = conversation.messages.findIndex((item) => item.id === messageId)
        if (index > -1) {
          const messages = conversation.messages.filter((item) => item.id !== messageId)
          if (messages.length) {
            _conversations.push({ ...conversation, messages })
          }
        } else {
          _conversations.push(conversation)
        }
      })
      return _conversations
    })
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
      const dropMessage = await dropActions[event.previousContainer.id].implementation(event, this)
      const messages = Array.isArray(dropMessage) ? dropMessage : [dropMessage]

      const currentConversation = this.currentConversation()
      const currentCommand = this.currentCommand()
      if (!currentConversation || currentConversation.type === 'command' && !currentCommand?.agent?.conversation) {
        this.newConversation({})
      }

      this.upsertMessage(
        ...messages.map((message) => ({ ...message, lcMessage: new HumanMessage({ content: message.content }) }))
      )
    }
  }

  async executeCommandSuggestion(
    input: string,
    options: { command: CopilotCommand; context: CopilotContext; signal?: AbortSignal }
  ): Promise<string> {
    const { command, context, signal } = options
    // Context content
    const contextContent = context ? await recognizeContext(input, context) : null
    const params = await recognizeContextParams(input, context)

    let systemPrompt = ''
    try {
      // Get System prompt
      if (command.systemPrompt) {
        systemPrompt = await command.systemPrompt({ params })
      }

      const llm = this.llm()
      const verbose = this.verbose()
      if (llm) {
        if (command.suggestionTemplate) {
          const chain = command.suggestionTemplate.pipe(this.llm()).pipe(new StringOutputParser())
          return await chain.invoke({ input, system_prompt: systemPrompt, context: contextContent, signal, verbose })
        } else {
          throw new Error('No completion template found')
        }
      } else {
        throw new Error('LLM is not available')
      }
    } catch (err: any) {
      throw new Error('Error: ' + err.message)
    }
  }
}
