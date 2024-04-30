import { HttpClient } from '@angular/common/http'
import { inject, Injectable, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { API_PREFIX } from '@metad/cloud/state'
import { CopilotService, ICopilot } from '@metad/copilot'
import { RequestOptions } from 'ai'
import { omit } from 'lodash-es'
import { distinctUntilChanged, filter, firstValueFrom, map, startWith, switchMap } from 'rxjs'
import { ICopilot as IServerCopilot } from '../types'
import { Store } from './store.service'
import { environment } from 'apps/cloud/src/environments/environment'

const baseUrl = environment.API_BASE_URL
const API_CHAT = (baseUrl ?? '') + '/api/ai/chat'
const API_AI_HOST = (baseUrl ?? '') + '/api/ai/proxy'

@Injectable({ providedIn: 'root' })
export class PACCopilotService extends CopilotService {
  readonly #store = inject(Store)
  readonly httpClient = inject(HttpClient)

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
        this.copilot = {
          enabled: false
        }
      }
      
    })

  constructor() {
    super()
  }

  requestOptions(): RequestOptions {
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
