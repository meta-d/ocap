import { ChatOpenAI, ClientOptions } from '@langchain/openai'
import { ChatOllama } from "@langchain/community/chat_models/ollama"
import { OllamaFunctions } from "@langchain/community/experimental/chat_models/ollama_functions";

// import { UseChatOptions as AiUseChatOptions, Message } from 'ai'
import { BehaviorSubject, catchError, combineLatest, map, of, shareReplay, switchMap } from 'rxjs'
import { fromFetch } from 'rxjs/fetch'
import {
  AI_PROVIDERS,
  AiProvider,
  BusinessRoleType,
  ICopilot,
  RequestOptions
} from './types'

// function chatCompletionsUrl(copilot: ICopilot) {
//   const apiHost: string = copilot.apiHost || AI_PROVIDERS[copilot.provider]?.apiHost
//   const chatCompletionsUrl: string = AI_PROVIDERS[copilot.provider]?.chatCompletionsUrl
//   return (
//     copilot.chatUrl ||
//     (apiHost?.endsWith('/') ? apiHost.slice(0, apiHost.length - 1) + chatCompletionsUrl : apiHost + chatCompletionsUrl)
//   )
// }

function modelsUrl(copilot: ICopilot) {
  const apiHost: string = copilot.apiHost || AI_PROVIDERS[copilot.provider]?.apiHost
  const modelsUrl: string = AI_PROVIDERS[copilot.provider]?.modelsUrl
  return (
    copilot.modelsUrl ||
    (apiHost?.endsWith('/') ? apiHost.slice(0, apiHost.length - 1) + modelsUrl : apiHost + modelsUrl)
  )
}

// export type UseChatOptions = AiUseChatOptions & {
//   appendMessage?: (message: Message) => void
//   abortController?: AbortController | null
//   model: string
// }

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

  readonly clientOptions$ = new BehaviorSubject<ClientOptions>(null)

  readonly llm$ = combineLatest([this.copilot$, this.clientOptions$]).pipe(
    map(([copilot, clientOptions]) => {
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
              ...(clientOptions ?? {})
            },
            model: copilot.defaultModel,
            temperature: 0,
          })
        case AiProvider.Ollama:
          return new OllamaFunctions({
            baseUrl: copilot.apiHost || null,
            model: copilot.defaultModel,
            headers: {
              ...(clientOptions?.defaultHeaders ?? {})
            }
          }) as unknown as ChatOpenAI
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

  /**
   * @deprecated use getClientOptions
   */
  requestOptions(): RequestOptions {
    return {}
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

}
