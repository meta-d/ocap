import { HttpClient } from '@angular/common/http'
import { Injectable, inject, signal } from '@angular/core'
import { API_PREFIX, Store } from '@metad/cloud/state'
import { nonNullable } from '@metad/core'
import { environment } from 'apps/cloud/src/environments/environment'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { distinctUntilChanged, filter, map } from 'rxjs/operators'
import { Socket, io } from 'socket.io-client'
import { AuthStrategy } from '../auth'

@Injectable({ providedIn: 'root' })
export class AgentService {
  readonly #http = inject(HttpClient)
  readonly #store = inject(Store)
  readonly #auth = inject(AuthStrategy)

  readonly socket$ = new BehaviorSubject<Socket>(null)
  get socket() {
    return this.socket$.value
  }
  set socket(socket: Socket) {
    this.socket$.next(socket)
  }

  readonly #connected$ = new Subject<boolean>()
  readonly #disconnected$ = new Subject<boolean>()
  readonly connected$ = this.#connected$.asObservable().pipe(distinctUntilChanged())
  readonly disconnected$ = this.#disconnected$.asObservable().pipe(distinctUntilChanged())

  readonly retry = signal(0)

  refreshToken() {
    this.retry.update((retry) => retry + 1)
    if (this.retry() < 3) {
      this.#auth.refreshToken().subscribe(() => {
        this.connect()
      })
    }
  }

  connect() {
    if (!this.socket || this.socket.disconnected) {
      this.socket = io(`${getWebSocketUrl(environment.API_BASE_URL)}/?jwt-token=${this.#store.token}`)
      this.socket.on('connect', () => {
        this.#connected$.next(true)
        this.retry.set(0)
      })
      this.socket.on('exception', (data) => {
        console.error('exception', data)
        this.#disconnected$.next(true)
        if (data.status === 401) {
          this.refreshToken()
        }
      })
      this.socket.on('disconnect', () => {
        this.#disconnected$.next(true)
      })

      this.socket.io
    }

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
    }
  }

  emit(event: string, ...args: any[]) {
    this.socket.emit(event, ...args)
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket$.pipe(filter(nonNullable)).subscribe((socket) => {
      socket.on(event, callback)
    })
  }

  getTenantAgentLocal(): Observable<string> {
    return this.#http.get<any>(`${API_PREFIX}/agent`).pipe(
      map((result) => {
        if (result.success) {
          return result.record?.value
        }
        return null
      })
    )
  }
}

function getWebSocketUrl(url: string) {
  return (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + url.replace('http:', '').replace('https:', '')
}
