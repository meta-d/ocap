import { HttpClient } from '@angular/common/http'
import { effect, inject, Injectable, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { API_PREFIX } from '@metad/cloud/state'
import { BusinessRoleType, ICopilot, RequestOptions } from '@metad/copilot'
import { NgmCopilotService } from '@metad/ocap-angular/copilot'
import { environment } from 'apps/cloud/src/environments/environment'
import { omit } from 'lodash-es'
import { distinctUntilChanged, filter, firstValueFrom, map, startWith, switchMap } from 'rxjs'
import { ICopilot as IServerCopilot } from '../types'
import { CopilotRoleService } from './copilot-role.service'
import { Store } from './store.service'

const baseUrl = environment.API_BASE_URL
const API_CHAT = constructUrl(baseUrl) + '/api/ai/chat'
const API_AI_HOST = constructUrl(baseUrl) + '/api/ai/proxy'

@Injectable({ providedIn: 'root' })
export class PACCopilotService extends NgmCopilotService {
  readonly #store = inject(Store)
  readonly httpClient = inject(HttpClient)
  readonly roleService = inject(CopilotRoleService)

  readonly copilotConfig = signal<ICopilot>(null)

  // Init copilot config
  private _userSub = this.#store.user$
    .pipe(
      map((user) => user?.id),
      startWith(null),
      distinctUntilChanged(),
      filter(Boolean),
      switchMap(() => this.#store.selectOrganizationId()),
      switchMap(() => this.httpClient.get<{ total: number; items: ICopilot[] }>(API_PREFIX + '/copilot')),
      takeUntilDestroyed()
    )
    .subscribe((result) => {
      if (result.total > 0) {
        this.copilotConfig.set(result.items[0])
        this.copilot = {
          ...result.items[0],
          chatUrl: API_CHAT,
          apiHost: API_AI_HOST,
          apiKey: this.#store.token
        }
      } else {
        this.copilotConfig.set(null)
        this.copilot = {
          enabled: false
        }
      }
    })

  private roleSub = this.roleService
    .getAll()
    .pipe(takeUntilDestroyed())
    .subscribe((roles) => {
      this.roles.set(roles as BusinessRoleType[])
    })

  constructor() {
    super()

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

  override requestOptions(): RequestOptions {
    return {
      headers: {
        'Organization-Id': `${this.#store.selectedOrganization?.id}`,
        Authorization: `Bearer ${this.#store.token}`
      }
    }
  }

  async upsertOne(input: Partial<IServerCopilot>) {
    const copilot = await firstValueFrom(
      this.httpClient.post<ICopilot>(API_PREFIX + '/copilot', input.id ? input : omit(input, 'id'))
    )
    this.copilotConfig.set(copilot)
    this.copilot = {
      ...copilot,
      chatUrl: API_CHAT,
      apiHost: API_AI_HOST
    }
  }
}

function constructUrl(url: string) {
  const protocol = window.location.protocol

  if (url?.startsWith('http')) {
    return url
  }

  return url ? `${protocol}${url}` : ''
}
