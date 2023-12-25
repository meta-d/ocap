import { Injectable, computed, inject, signal } from '@angular/core'
import {
  AIOptions,
  AnnotatedFunction,
  CopilotChatMessage,
  CopilotChatResponseChoice,
  CopilotCommand,
  CopilotEngine,
  processChatStream
} from '@metad/copilot'
import { Observable } from 'rxjs'
import { FunctionCallHandler, ChatRequestOptions, Message, JSONValue, ChatRequest, nanoid } from 'ai'
import { ChatCompletionCreateParams } from "openai/resources/chat"
import { createSWRStore } from 'swr-store';
import { NgmCopilotService } from './copilot.service'
import { pick } from 'lodash-es'

let uniqueId = 0;
const store: Record<string, Message[] | undefined> = {};
const chatApiStore = createSWRStore<Message[], string[]>({
  get: async (key: string) => {
    return store[key] ?? [];
  },
});

@Injectable()
export class NgmCopilotEngineService implements CopilotEngine {

  private api = signal('/api/chat')
  private chatId = `chat-${uniqueId++}`
  private key = computed(() => `${this.api()}|${this.chatId}`)

  readonly copilot = inject(NgmCopilotService)
  name?: string
  aiOptions: AIOptions

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

  setEntryPoint(id: string, entryPoint: AnnotatedFunction<any[]>) {
    console.log(`setEntryPoint: ${id}`, entryPoint)
    this.#entryPoints.update((state) => ({
      ...state,
      [id]: entryPoint
    }))
  }

  removeEntryPoint(id: string) {
    console.log(`removeEntryPoint: ${id}`)
    this.#entryPoints.update((prevPoints) => {
      const newPoints = { ...prevPoints }
      delete newPoints[id]
      return newPoints
    })
  }

  registerCommand(name: string, command: CopilotCommand) {
    this.#commands.update((state) => (
      {
        ...state,
        [name]: command
      }
    ))

    console.log(`registerCommand: ${name}`, command)
  }

  unregisterCommand(name: string) {
    this.#commands.update((state) => {
      delete state[name]
      return {
        ...state,
      }
    })
  }

  getCommand(name: string) {
    return this.#commands()[name]
  }

  process(
    data: { prompt: string; messages?: CopilotChatMessage[] },
    options?: { action?: string }
  ): Observable<string | CopilotChatMessage[]> {
    throw new Error('Method not implemented.')
  }
  preprocess?: (prompt: string, options?: any) => void
  postprocess?(prompt: string, choices: CopilotChatResponseChoice[]): Observable<string | CopilotChatMessage[]> {
    throw new Error('Method not implemented.')
  }

  dropCopilot: (event: any) => void

  // useChat
  mutate(data: Message[]) {
    this.messages.set(data)

    // store[this.key()] = data
    // return chatApiStore.mutate([this.key()], {
    //   status: 'success',
    //   data,
    // })
  }

  async triggerRequest(
    messagesSnapshot: Message[],
    { options, data }: ChatRequestOptions = {},
  ): Promise<ChatRequest | null | undefined> {
    let abortController = null
    try {
      this.error.set(undefined)
      this.isLoading.set(true)
      abortController = new AbortController()

      const getCurrentMessages = () =>
        this.messages() ?? []
        // chatApiStore.get([this.key()], {
        //   shouldRevalidate: false,
        // })

      // Do an optimistic update to the chat state to show the updated messages
      // immediately.
      const previousMessages = getCurrentMessages();
      this.mutate(messagesSnapshot)

      let chatRequest: ChatRequest = {
        messages: messagesSnapshot,
        options,
        data,
      }

      await processChatStream({
        getStreamedResponse: async () => {
          const existingData = this.streamData() ?? [];

          return await this.copilot.chat({
            body: {
              functions: this.getChatCompletionFunctionDescriptions(),
              ...pick(this.aiOptions, 'model', 'temperature'),
              ...(options?.body ?? {}),
            },
            onFinish: (message) => {
              console.log(`onFinish`, message)
            }
          }, chatRequest, { options, data }, abortController);
        },
        experimental_onFunctionCall: this.getFunctionCallHandler(),
        updateChatRequest(newChatRequest) {
          chatRequest = newChatRequest;
          console.log(`The chat Request after FunctionCall`, newChatRequest)
        },
        getCurrentMessages: () => getCurrentMessages(),
      });

      abortController = null;
    } catch (err) {
      // Ignore abort errors as they are expected.
      if ((err as any).name === 'AbortError') {
        abortController = null;
        return null;
      }

      if (err instanceof Error) {
        this.error.set(err)
      }

      this.error.set(err as Error)
    } finally {
      this.isLoading.set(false)
    }
  }

  async append(message: Message, options: ChatRequestOptions): Promise<ChatRequest | null | undefined> {
    if (!message.id) {
      message.id = this.generateId();
    }
    return this.triggerRequest(
      (this.messages() ?? []).concat(message as Message),
      options,
    );
  };

  generateId() {
    return nanoid()
  }
}


export const defaultCopilotContextCategories = ["global"];

function entryPointsToFunctionCallHandler(
  entryPoints: AnnotatedFunction<any[]>[],
): FunctionCallHandler {
  return async (chatMessages, functionCall) => {
    let entrypointsByFunctionName: Record<string, AnnotatedFunction<any[]>> = {};
    for (let entryPoint of entryPoints) {
      entrypointsByFunctionName[entryPoint.name] = entryPoint;
    }

    const entryPointFunction = entrypointsByFunctionName[functionCall.name || ""];
    if (entryPointFunction) {
      let parsedFunctionCallArguments: Record<string, any>[] = [];
      if (functionCall.arguments) {
        parsedFunctionCallArguments = JSON.parse(functionCall.arguments);
      }

      const paramsInCorrectOrder: any[] = [];
      for (let arg of entryPointFunction.argumentAnnotations) {
        paramsInCorrectOrder.push(
          parsedFunctionCallArguments[arg.name as keyof typeof parsedFunctionCallArguments],
        );
      }

      return await entryPointFunction.implementation(...paramsInCorrectOrder);

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
  };
}

function entryPointsToChatCompletionFunctions(
  entryPoints: AnnotatedFunction<any[]>[],
): ChatCompletionCreateParams.Function[] {
  return entryPoints.map(annotatedFunctionToChatCompletionFunction);
}

function annotatedFunctionToChatCompletionFunction(
  annotatedFunction: AnnotatedFunction<any[]>,
): ChatCompletionCreateParams.Function {
  // Create the parameters object based on the argumentAnnotations
  let parameters: { [key: string]: any } = {};
  for (let arg of annotatedFunction.argumentAnnotations) {
    // isolate the args we should forward inline
    let { name, required, ...forwardedArgs } = arg;
    parameters[arg.name] = forwardedArgs;
  }

  let requiredParameterNames: string[] = [];
  for (let arg of annotatedFunction.argumentAnnotations) {
    if (arg.required) {
      requiredParameterNames.push(arg.name);
    }
  }

  // Create the ChatCompletionFunctions object
  let chatCompletionFunction: ChatCompletionCreateParams.Function = {
    name: annotatedFunction.name,
    description: annotatedFunction.description,
    parameters: {
      type: "object",
      properties: parameters,
      required: requiredParameterNames,
    },
  };

  return chatCompletionFunction;
}
