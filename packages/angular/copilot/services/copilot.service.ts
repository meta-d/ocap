import { Injectable, InjectionToken, inject } from '@angular/core'
import { CopilotService, ICopilot } from '@metad/copilot'
import type { AxiosRequestConfig } from 'axios'
import OpenAI from 'openai'
import { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from 'openai/resources'
import { BehaviorSubject } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class NgmCopilotService extends CopilotService {
  static CopilotConfigFactoryToken = new InjectionToken<() => Promise<ICopilot>>('CopilotConfigFactoryToken')

  #copilotConfigFactory: () => Promise<ICopilot> = inject(NgmCopilotService.CopilotConfigFactoryToken)

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

  constructor() {
    super()

    // Init copilot config
    this.#copilotConfigFactory().then((copilot) => {
      this.copilot = copilot
      this.openai = new OpenAI({
        apiKey: copilot.apiKey
      })
      this._copilot$.next(copilot)
    })
  }

  async createCompletion(
    prompt: string,
    options?: { completionRequest?: ChatCompletionCreateParamsNonStreaming; axiosConfig?: AxiosRequestConfig }
  ): Promise<ChatCompletion.Choice[]> {
    const { completionRequest, axiosConfig } = options ?? {}
    const completion = await this.openai.chat.completions.create(
      {
        model: 'text-davinci-003',
        temperature: 0.6,
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
        ...(completionRequest ?? {})
      },
      // 由于本项目用到 Axios 与 openAi APi 中用到的 Axios 版本不一样，导致 AxiosRequestConfig 中的 method 类型有所不同
      axiosConfig as any
    )

    return completion.choices
  }
}
