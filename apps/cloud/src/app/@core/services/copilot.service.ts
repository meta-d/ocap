import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { omit } from '@metad/ocap-core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { API_PREFIX } from '@metad/cloud/state'
import { NgmCopilotService } from '@metad/core'
import type { AxiosRequestConfig } from 'axios'
import { BehaviorSubject, firstValueFrom } from 'rxjs'
import { distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators'
import { ICopilot } from '../types'
import { Store } from './store.service'
import OpenAI from 'openai'

@UntilDestroy({ checkProperties: true })
@Injectable({ providedIn: 'root' })
export class CopilotService extends NgmCopilotService {
  private httpClient = inject(HttpClient)
  private store = inject(Store)

  private _copilot$ = new BehaviorSubject<ICopilot>(null)
  public copilot$ = this._copilot$.asObservable()
  public notEnabled$ = this.copilot$.pipe(map((copilot) => !(copilot?.enabled && copilot?.apiKey)))

  get enabled() {
    return this.copilot?.enabled
  }
  get hasKey() {
    return !!this.copilot?.apiKey
  }
  openai: OpenAI
  // Subscribers
  // Init copilot config
  private _userSub = this.store.user$
    .pipe(
      map((user) => user?.id),
      startWith(null),
      distinctUntilChanged(),
      filter(Boolean),
      switchMap(() => this.store.selectOrganizationId()),
      switchMap(async (orgId) => this.getOne(orgId))
    )
    .subscribe(() => {
      //
    })
  // React to copilot config change
  private _copilotSub = this._copilot$
    .pipe(
      filter((copilot) => !!copilot?.apiKey)
    )
    .subscribe((copilot) => {
      this.copilot = copilot
      this.openai = new OpenAI({
        apiKey: copilot.apiKey
      })
    })

  async getOne(orgId?: string) {
    const result = await firstValueFrom(this.httpClient.get<{ items: ICopilot[] }>(API_PREFIX + '/copilot'))
    this._copilot$.next(result.items[0])
    return this._copilot$.value
  }

  async upsertOne(input: Partial<ICopilot>) {
    const copilot = await firstValueFrom(this.httpClient.post(API_PREFIX + '/copilot', input.id ? input : omit(input, 'id')))
    this._copilot$.next(copilot)
  }

  async createCompletion(...params: any[]) {
    return []
  }
  async createEdit(...params: any[]) {}

  // async createCompletion(
  //   prompt: string,
  //   options?: { completionRequest?: CreateCompletionRequest; axiosConfig?: AxiosRequestConfig }
  // ) {
  //   const { completionRequest, axiosConfig } = options ?? {}
  //   const completion = await this.openai.createCompletion(
  //     {
  //       model: 'text-davinci-003',
  //       prompt: prompt,
  //       temperature: 0.6,
  //       max_tokens: 1000,
  //       ...(completionRequest ?? {})
  //     },
  //     // 由于本项目用到 Axios 与 openAi APi 中用到的 Axios 版本不一样，导致 AxiosRequestConfig 中的 method 类型有所不同
  //     axiosConfig as any
  //   )

  //   return completion.data.choices
  // }

  // async createEdit(editRequest: Partial<CreateEditRequest>) {
  //   const edit = await this.openai.createEdit({
  //     ...editRequest,
  //     model: 'code-davinci-edit-001',
  //   } as CreateEditRequest)

  //   return edit.data.choices
  // }
}
