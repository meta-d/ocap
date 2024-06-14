import { ChatOpenAI, ClientOptions } from '@langchain/openai'
import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source'
import { UseChatOptions as AiUseChatOptions, ChatRequest, ChatRequestOptions, JSONValue, Message, nanoid } from 'ai'
import { BehaviorSubject, Observable, catchError, map, of, shareReplay, switchMap, throwError } from 'rxjs'
import { fromFetch } from 'rxjs/fetch'
import { callChatApi as callDashScopeChatApi } from './dashscope/'
import { callChatApi } from './shared/call-chat-api'
import {
  AI_PROVIDERS,
  AiProvider,
  BusinessRoleType,
  CopilotChatMessage,
  DefaultModel,
  ICopilot,
  RequestOptions
} from './types'

function chatCompletionsUrl(copilot: ICopilot) {
  const apiHost: string = copilot.apiHost || AI_PROVIDERS[copilot.provider]?.apiHost
  const chatCompletionsUrl: string = AI_PROVIDERS[copilot.provider]?.chatCompletionsUrl
  return (
    copilot.chatUrl ||
    (apiHost?.endsWith('/') ? apiHost.slice(0, apiHost.length - 1) + chatCompletionsUrl : apiHost + chatCompletionsUrl)
  )
}

function modelsUrl(copilot: ICopilot) {
  const apiHost: string = copilot.apiHost || AI_PROVIDERS[copilot.provider]?.apiHost
  const modelsUrl: string = AI_PROVIDERS[copilot.provider]?.modelsUrl
  return (
    copilot.modelsUrl ||
    (apiHost?.endsWith('/') ? apiHost.slice(0, apiHost.length - 1) + modelsUrl : apiHost + modelsUrl)
  )
}

export type UseChatOptions = AiUseChatOptions & {
  appendMessage?: (message: Message) => void
  abortController?: AbortController | null
  model: string
}

/**
 * Copilot Service
 */
export abstract class CopilotService {
  readonly #copilot$ = new BehaviorSubject<ICopilot | null>({} as ICopilot)
  get copilot(): ICopilot {
    return this.#copilot$.value
  }
  set copilot(value: Partial<ICopilot> | null) {
    this.#copilot$.next(
      value
        ? {
            ...this.#copilot$.value,
            ...value
          }
        : null
    )
  }

  readonly copilot$ = this.#copilot$.asObservable()
  readonly enabled$ = this.copilot$.pipe(map((copilot) => copilot?.enabled && copilot?.apiKey))
  /**
   * If the provider has tools function
   */
  readonly isTools$ = this.copilot$.pipe(map((copilot) => copilot?.provider && AI_PROVIDERS[copilot.provider]?.isTools))

  readonly llm$ = this.copilot$.pipe(
    map((copilot) => {
      switch (copilot.provider) {
        case AiProvider.OpenAI:
        case AiProvider.Azure:
          return new ChatOpenAI({
            apiKey: copilot.apiKey,
            configuration: {
              baseURL: copilot.apiHost || null,
              defaultHeaders: {
                ...(this.requestOptions().headers ?? {})
              },
              ...(this.getClientOptions() ?? {})
            },
            model: copilot.defaultModel,
            temperature: 0,
          })
        default:
          return null
      }
    }),
    shareReplay(1)
  )

  constructor(copilot?: ICopilot) {
    if (copilot) {
      this.copilot = copilot
    }
  }

  update(copilot: Partial<ICopilot>) {
    this.copilot = copilot
  }

  abstract roles(): BusinessRoleType[]
  abstract role(): string
  abstract setRole(role: string): void
  abstract getClientOptions(): ClientOptions

  /**
   * @deprecated use getClientOptions
   */
  requestOptions(): RequestOptions {
    return {}
  }

  /**
   * @deprecated use langchain/openai instead
   */
  async createChat(
    messages: CopilotChatMessage[],
    options?: {
      request?: any
      signal?: AbortSignal
    }
  ) {
    const { request, signal } = options ?? {}
    const response = await fetch(chatCompletionsUrl(this.copilot), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...((this.requestOptions()?.headers ?? {}) as Record<string, string>)
      },
      signal,
      body: JSON.stringify({
        model: DefaultModel,
        messages: messages.map((message) => ({
          role: message.role,
          content: message.content
        })),
        ...(request ?? {})
      })
    })

    if (response.status === 200) {
      const answer = await response.json()
      return answer.choices
    }

    throw new Error((await response.json()).error?.message)
  }

  /**
   * @deprecated use langchain/openai instead
   */
  chatCompletions(messages: CopilotChatMessage[], request?: any): Observable<any> {
    return fromFetch(chatCompletionsUrl(this.copilot), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...((this.requestOptions()?.headers ?? {}) as Record<string, string>)
        // Authorization: `Bearer ${this.copilot.apiKey}`
      },
      body: JSON.stringify({
        model: DefaultModel,
        messages: messages.map((message) => ({
          role: message.role,
          content: message.content
        })),
        ...(request ?? {})
      })
    }).pipe(
      switchMap((response) => {
        if (response.ok) {
          // OK return data
          return response.json()
        } else {
          // Server is returning a status requiring the client to try something else.

          return throwError(() => `Error ${response.status}`)
        }
      })
    )
  }

  /**
   * @deprecated use langchain/openai instead
   */
  chatStream(messages: CopilotChatMessage[], request?: any) {
    return new Observable<any[]>((subscriber) => {
      const ctrl = new AbortController()
      fetchEventSource(chatCompletionsUrl(this.copilot), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...((this.requestOptions()?.headers ?? {}) as Record<string, string>)
          // Authorization: `Bearer ${this.copilot.apiKey}`
        },
        body: JSON.stringify({
          model: DefaultModel,
          messages: messages.map((message) => ({
            role: message.role,
            content: message.content
          })),
          ...(request ?? {}),
          stream: true
        }),
        signal: ctrl.signal,
        async onopen(response) {
          if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
            return // everything's good
          } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            // client-side errors are usually non-retriable:
            subscriber.error(response.status)
          } else {
            subscriber.error(response.status)
          }
        },
        onmessage(msg) {
          // if the server emits an error message, throw an exception
          // so it gets handled by the onerror callback below:
          if (msg.event === 'FatalError') {
            throw new Error(msg.data)
          }

          if (msg.data === `"[DONE]"` || msg.data === '[DONE]') {
            subscriber.complete()
          } else {
            try {
              subscriber.next(JSON.parse(msg.data))
            } catch (err) {
              subscriber.error(err)
            }
          }
        },
        onclose() {
          // if the server closes the connection unexpectedly, retry:
          // throw new Error()
          subscriber.complete()
        },
        onerror(err) {
          subscriber.error(err)
          ctrl.abort()
        }
      })

      return () => ctrl.abort()
    })
  }

  getModels() {
    return fromFetch(modelsUrl(this.copilot), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...((this.requestOptions()?.headers ?? {}) as Record<string, string>)
        // Authorization: `Bearer ${this.copilot.apiKey}`
      }
    }).pipe(
      switchMap((response) => {
        if (response.ok) {
          // OK return data
          return response.json()
        } else {
          // Server is returning a status requiring the client to try something else.
          return of({ error: true, message: `Error ${response.status}` })
        }
      }),
      catchError((err) => {
        // Network or other error, handle appropriately
        console.error(err)
        return of({ error: true, message: err.message })
      })
    )
  }

  /**
   * @deprecated use langchain/openai instead
   */
  async chat(
    {
      sendExtraMessageFields,
      onResponse,
      onFinish,
      onError,
      appendMessage,
      credentials,
      headers,
      body,
      generateId = nanoid,
      abortController,
      model
    }: UseChatOptions = {
      model: DefaultModel
    },
    chatRequest: ChatRequest,
    { options, data }: ChatRequestOptions = {}
  ): Promise<Message | { messages: Message[]; data: JSONValue[] }> {
    const callChatApiFuc = this.copilot.provider === AiProvider.DashScope ? callDashScopeChatApi : callChatApi
    return await callChatApiFuc({
      api: chatCompletionsUrl(this.copilot),
      model,
      chatRequest,
      messages: sendExtraMessageFields
        ? chatRequest.messages
        : chatRequest.messages.map(({ role, content, name, function_call }) => ({
            role,
            content,
            ...(name !== undefined && { name }),
            ...(function_call !== undefined && {
              function_call
            })
          })),
      body: {
        data: chatRequest.data,
        ...body,
        ...(options?.body ?? {})
      },
      headers: {
        ...(this.requestOptions()?.headers ?? {}),
        ...headers,
        ...(options?.headers ?? {})
      },
      abortController: () => abortController,
      credentials,
      onResponse,
      onUpdate(merged, data) {
        console.log(`onUpdate`, merged, data)
        // mutate([...chatRequest.messages, ...merged]);
        // setStreamData([...existingData, ...(data ?? [])]);
      },
      onFinish,
      appendMessage,
      restoreMessagesOnFailure() {
        // Restore the previous messages if the request fails.
        // if (previousMessages.status === 'success') {
        //   mutate(previousMessages.data);
        // }
      },
      generateId
    })
  }
}
