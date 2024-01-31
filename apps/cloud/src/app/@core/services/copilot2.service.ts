import { inject, Injectable, InjectionToken } from '@angular/core'
import { CopilotService, ICopilot } from '@metad/copilot'
import { RequestOptions } from 'ai'
import { Store } from './store.service'
import { HttpClient } from '@angular/common/http'
import { distinctUntilChanged, filter, firstValueFrom, map, startWith, switchMap } from 'rxjs'
import { API_PREFIX } from '@metad/cloud/state'
import { omit } from 'lodash-es'
import { ICopilot as IServerCopilot } from '../types'

@Injectable({ providedIn: 'root' })
export class PACCopilotService extends CopilotService {
  readonly #store = inject(Store)
  readonly httpClient = inject(HttpClient)

  // Init copilot config
  private _userSub = this.#store.user$
    .pipe(
      map((user) => user?.id),
      startWith(null),
      distinctUntilChanged(),
      filter(Boolean),
      switchMap(() => this.#store.selectOrganizationId()),
      switchMap(async (orgId) => this.getOne(orgId))
    )
    .subscribe(() => {
      //
    })

  // static CopilotConfigFactoryToken = new InjectionToken<() => Promise<ICopilot>>('CopilotConfigFactoryToken')
  // #copilotConfigFactory: () => Promise<ICopilot> = inject(PACCopilotService.CopilotConfigFactoryToken)

  constructor() {
    super()

    // Init copilot config
    // this.#copilotConfigFactory().then((copilot) => {
    //   this.copilot = {
    //     ...copilot,
    //     chatUrl: '/api/ai/chat'
    //   }
    // })
  }

  requestOptions(): RequestOptions {
    return {
      headers: {
        'Organization-Id': `${this.#store.selectedOrganization?.id}`,
        Authorization: `Bearer ${this.#store.token}`
      }
    }
  }

  async getOne(orgId?: string) {
    const result = await firstValueFrom(this.httpClient.get<{ items: ICopilot[] }>(API_PREFIX + '/copilot'))
    this.copilot = {
      ...result.items[0],
      chatUrl: '/api/ai/chat'
    }
    return this.copilot
  }

  async upsertOne(input: Partial<IServerCopilot>) {
    const copilot = await firstValueFrom(
      this.httpClient.post(API_PREFIX + '/copilot', input.id ? input : omit(input, 'id'))
    )
    this.copilot = {
      ...copilot,
      chatUrl: '/api/ai/chat'
    }
  }
}
