import { Injectable, computed, effect, inject, signal } from '@angular/core'
import {
  AIOptions,
  AnnotatedFunction,
  CopilotChatMessage,
  CopilotChatMessageRoleEnum,
  CopilotCommand,
  CopilotEngine,
  CopilotService,
  DefaultModel,
  SystemCommandClear,
  getCommandPrompt,
  processChatStream
} from '@metad/copilot'
import { ChatRequest, ChatRequestOptions, FunctionCallHandler, JSONValue, Message, nanoid } from 'ai'
import { pick } from 'lodash-es'
import { NGXLogger } from 'ngx-logger'
import { ChatCompletionCreateParams } from 'openai/resources/chat'
import { Observable, from, map, of, throwError } from 'rxjs'

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
  set conversations(value: CopilotChatMessage[]) {
    this.conversations$.set(value ?? [])
  }

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

  // Chat
  readonly messages = signal<Message[]>([])

  // Chat States
  error = signal<undefined | Error>(undefined)
  streamData = signal<JSONValue[] | undefined>(undefined)
  isLoading = signal(false)

  constructor() {
    effect(() => {
      console.log(this.conversations$())
    })
  }

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
    data: { prompt: string; messages?: CopilotChatMessage[] },
    options?: { action?: string }
  ): Observable<string | Message | void> {
    this.#logger?.debug(`process ask: ${data.prompt}`)

    const { command, prompt } = getCommandPrompt(data.prompt)
    if (command) {
      if (command === SystemCommandClear) {
        this.conversations = []
        return of(null)
      } else if (!this.getCommand(command)) {
        return throwError(() => new Error(`Command '${command}' not found`))
      }

      const _command = this.getCommand(command)

      if (_command.implementation) {
        return from(_command.implementation())
      }

      const messages: CopilotChatMessage[] = [...(data.messages ?? [])] //@todo 是否应该添加历史记录，什么情况下带上？
      if (_command.systemPrompt) {
        messages.push({
          id: nanoid(),
          role: CopilotChatMessageRoleEnum.System,
          content: _command.systemPrompt()
        })
      }

      return from(
        this.triggerRequest(
          [
            ...messages,
            {
              id: nanoid(),
              role: CopilotChatMessageRoleEnum.User,
              content: prompt
            }
          ],
          {
            options: {
              body: {
                ...this.aiOptions,
                functions: _command.actions
                  ? entryPointsToChatCompletionFunctions(_command.actions.map((id) => this.#entryPoints()[id]))
                  : this.getChatCompletionFunctionDescriptions()
              }
            }
          }
        )
      ).pipe(map(() => ''))
    }

    return from(
      this.triggerRequest(
        [
          ...((data.messages ?? []) as any[]),
          {
            id: nanoid(),
            role: CopilotChatMessageRoleEnum.User,
            content: prompt
          }
        ],
        {
          options: {
            body: {
              ...this.aiOptions,
              functions: this.getChatCompletionFunctionDescriptions()
            }
          }
        }
      )
    ).pipe(map(() => ''))
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

      const getCurrentMessages = () => this.messages() ?? []
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

      await processChatStream({
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
                  console.log(`onFinish`, message)
                  this.conversations$.update((state) => [...state, message] as any[])
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
          this.conversations$.update((state) => {
            const messages = [...state]
            newChatRequest.messages.forEach((message) => {
              const index = messages.findIndex((item) => item.id && item.id === message.id)
              if (index > -1) {
                messages[index] = message
              } else {
                messages.push(message)
              }
            })
            return messages
          })
        },
        getCurrentMessages: () => getCurrentMessages()
      })

      abortController = null
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
    return this.triggerRequest((this.messages() ?? []).concat(message as Message), options)
  }

  generateId() {
    return nanoid()
  }

  clear() {
    this.conversations$.set([])
  }
}

export const defaultCopilotContextCategories = ['global']

function entryPointsToFunctionCallHandler(entryPoints: AnnotatedFunction<any[]>[]): FunctionCallHandler {
  return async (chatMessages, functionCall) => {
    let entrypointsByFunctionName: Record<string, AnnotatedFunction<any[]>> = {}
    for (let entryPoint of entryPoints) {
      entrypointsByFunctionName[entryPoint.name] = entryPoint
    }

    const entryPointFunction = entrypointsByFunctionName[functionCall.name || '']
    if (entryPointFunction) {
      let parsedFunctionCallArguments: Record<string, any>[] = []
      if (functionCall.arguments) {
        parsedFunctionCallArguments = JSON.parse(functionCall.arguments)
      }

      const paramsInCorrectOrder: any[] = []
      for (let arg of entryPointFunction.argumentAnnotations) {
        paramsInCorrectOrder.push(parsedFunctionCallArguments[arg.name as keyof typeof parsedFunctionCallArguments])
      }

      return await entryPointFunction.implementation(...paramsInCorrectOrder)

      // commented out becasue for now we don't want to return anything
      // const result = await entryPointFunction.implementation(
      //   ...parsedFunctionCallArguments
      // );
      // const functionResponse: ChatRequest = {
      //   messages: [
      //     ...chatMessages,
      //     {
      //       id: nanoid(),
      //       name: functionCall.name,
      //       role: 'function' as const,
      //       content: JSON.stringify(result),
      //     },
      //   ],
      // };

      // return functionResponse;
    }
  }
}

function entryPointsToChatCompletionFunctions(
  entryPoints: AnnotatedFunction<any[]>[]
): ChatCompletionCreateParams.Function[] {
  return entryPoints.map(annotatedFunctionToChatCompletionFunction)
}

function annotatedFunctionToChatCompletionFunction(
  annotatedFunction: AnnotatedFunction<any[]>
): ChatCompletionCreateParams.Function {
  // Create the parameters object based on the argumentAnnotations
  let parameters: { [key: string]: any } = {}
  for (let arg of annotatedFunction.argumentAnnotations) {
    // isolate the args we should forward inline
    let { name, required, ...forwardedArgs } = arg
    parameters[arg.name] = forwardedArgs
  }

  let requiredParameterNames: string[] = []
  for (let arg of annotatedFunction.argumentAnnotations) {
    if (arg.required) {
      requiredParameterNames.push(arg.name)
    }
  }

  // Create the ChatCompletionFunctions object
  let chatCompletionFunction: ChatCompletionCreateParams.Function = {
    name: annotatedFunction.name,
    description: annotatedFunction.description,
    parameters: {
      type: 'object',
      properties: parameters,
      required: requiredParameterNames
    }
  }

  return chatCompletionFunction
}
