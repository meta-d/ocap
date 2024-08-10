import { HttpClient } from '@angular/common/http'
import { effect, inject, Injectable, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { Router } from '@angular/router'
import { API_PREFIX, AuthService } from '@metad/cloud/state'
import { AiProviderRole, BusinessRoleType, ICopilot } from '@metad/copilot'
import { NgmCopilotService } from '@metad/copilot-angular'
import { environment } from 'apps/cloud/src/environments/environment'
import { omit } from 'lodash-es'
import { combineLatest, distinctUntilChanged, filter, firstValueFrom, map, startWith, switchMap } from 'rxjs'
import { ICopilot as IServerCopilot } from '../types'
import { CopilotRoleService } from './copilot-role.service'
import { Store } from './store.service'
import { AgentService } from './agent.service'
import { pick } from '@metad/ocap-core'

const baseUrl = environment.API_BASE_URL
const API_CHAT = constructUrl(baseUrl) + '/api/ai/chat'
const API_AI_HOST = constructUrl(baseUrl) + '/api/ai/proxy'

@Injectable({ providedIn: 'root' })
export class PACCopilotService extends NgmCopilotService {
  readonly #store = inject(Store)
  readonly httpClient = inject(HttpClient)
  readonly authService = inject(AuthService)
  readonly roleService = inject(CopilotRoleService)
  readonly router = inject(Router)
  readonly #agentService = inject(AgentService)

  readonly copilots = signal<(ICopilot & {organizationId: string})[]>(null)

  // Init copilot config
  private _userSub = this.#store.user$
    .pipe(
      map((user) => user?.id),
      startWith(null),
      distinctUntilChanged(),
      filter(Boolean),
      switchMap(() => this.#store.selectOrganizationId()),
      switchMap(() => this.httpClient.get<{ total: number; items: (ICopilot & {organizationId: string})[] }>(API_PREFIX + '/copilot')),
      takeUntilDestroyed()
    )
    .subscribe((result) => {
      this.copilots.set(result.items)
    })

  private roleSub = this.roleService
    .getAll()
    .pipe(takeUntilDestroyed())
    .subscribe((roles) => {
      this.roles.set(roles as BusinessRoleType[])
    })

  private clientOptionsSub = combineLatest([this.#store.token$, this.#store.selectOrganizationId()])
    .pipe(
      map(([token, organizationId]) => ({
        defaultHeaders: {
          'Organization-Id': `${organizationId}`,
          Authorization: `Bearer ${token}`
        },
        fetch: (async (url: string, request: RequestInit) => {
          try {
            const response = await fetch(url, request)
            // Refresh token if unauthorized
            if (response.status === 401) {
              try {
                await firstValueFrom(this.authService.isAlive())
                request.headers['authorization'] = this.getAuthorizationToken()
                return await fetch(url, request)
              } catch (error) {
                return response
              }
            }

            return response
          } catch (error) {
            console.error(error)
            return null
          }
        }) as any
      }))
    )
    .subscribe((options) => this.clientOptions$.next(options))

  private tokenSub = this.tokenUsage$.pipe(
    takeUntilDestroyed(),
  ).subscribe((usage) => {
    this.#agentService.emit('copilot', {
      organizationId: this.#store.organizationId,
      copilot: pick(usage.copilot, 'organizationId', 'provider', 'id'),
      tokenUsed: usage.tokenUsed
    })
  })

  constructor() {
    super()

    effect(
      () => {
        const items = this.copilots()
        if (items?.length > 0) {
          items.forEach((item) => {
            if (item.role === AiProviderRole.Primary) {
              this.copilot = {
                ...item,
                chatUrl: API_CHAT,
                apiHost: API_AI_HOST + `/${AiProviderRole.Primary}`,
                apiKey: this.#store.token
              }
            } else if (item.role === AiProviderRole.Secondary) {
              this.secondary = {
                ...item,
                apiHost: API_AI_HOST + `/${AiProviderRole.Secondary}`
              }
            }
          })
        } else {
          this.copilot = {
            enabled: false
          }
        }
      },
      { allowSignalWrites: true }
    )

    effect(
      () => {
        if (this.#store.copilotRole()) {
          this.role.set(this.#store.copilotRole())
        }
      },
      { allowSignalWrites: true }
    )

    effect(
      () => {
        this.#store.setCopilotRole(this.role())
      },
      { allowSignalWrites: true }
    )
  }

  private getAuthorizationToken() {
    return `Bearer ${this.#store.token}`
  }

  async upsertItems(items: Partial<IServerCopilot[]>) {
    items = await Promise.all(
      items.map((item) =>
        firstValueFrom(this.httpClient.post<ICopilot>(API_PREFIX + '/copilot', item.id ? item : omit(item, 'id')))
      )
    )

    this.copilots.set(items as (ICopilot & {organizationId: string})[])
  }

  enableCopilot(): void {
    this.router.navigate(['settings', 'copilot'])
  }
}

function constructUrl(url: string) {
  const protocol = window.location.protocol

  if (url?.startsWith('http')) {
    return url
  }

  return url ? `${protocol}${url}` : ''
}
