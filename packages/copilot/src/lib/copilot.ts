import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source'
import { Observable, catchError, of, switchMap, throwError } from 'rxjs'
import { fromFetch } from 'rxjs/fetch'
import { AI_PROVIDERS, CopilotChatMessage, DefaultModel, ICopilot } from './types'

export class CopilotService {
  // private _copilotDefault = {
  //   chatCompletionsUrl: '/v1/chat/completions'
  // } as ICopilot
  private _copilot = {} as ICopilot
  get copilot(): ICopilot {
    return this._copilot
  }
  set copilot(value: Partial<ICopilot>) {
    this._copilot = {
      // ...this._copilotDefault,
      ...this._copilot,
      ...(value ?? {})
    }
  }
  get chatCompletionsUrl() {
    return (
      (this.copilot.apiHost || AI_PROVIDERS[this.copilot.provider]?.apiHost) +
      AI_PROVIDERS[this.copilot.provider].chatCompletionsUrl
    )
  }
  get modelsUrl() {
    return (this.copilot.apiHost || AI_PROVIDERS[this.copilot.provider].apiHost) + '/v1/models'
  }

  constructor(copilot?: ICopilot) {
    if (copilot) {
      this.copilot = copilot
    }
  }

  async createChat(
    messages: CopilotChatMessage[],
    options?: {
      request?: any
      signal?: AbortSignal
    }
  ) {
    const { request, signal } = options ?? {}
    const response = await fetch(this.chatCompletionsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.copilot.apiKey}`
      },
      signal,
      body: JSON.stringify({
        model: DefaultModel,
        messages: messages,
        ...(request ?? {})
      })
    })

    if (response.status === 200) {
      const answer = await response.json()
      return answer.choices
    }

    throw new Error((await response.json()).error?.message)
  }

  chatCompletions(
    messages: CopilotChatMessage[],
    request?: any
  ): Observable<any> {
    return fromFetch(this.chatCompletionsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.copilot.apiKey}`
      },
      body: JSON.stringify({
        model: DefaultModel,
        messages: messages,
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

  chatStream(messages: CopilotChatMessage[], request?: any) {
    return new Observable<any[]>((subscriber) => {
      const ctrl = new AbortController()
      fetchEventSource(this.chatCompletionsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.copilot.apiKey}`
        },
        body: JSON.stringify({
          model: DefaultModel,
          messages: messages,
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
    return fromFetch(this.modelsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.copilot.apiKey}`
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
