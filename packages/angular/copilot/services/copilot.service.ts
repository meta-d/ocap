import { Injectable, InjectionToken, inject } from '@angular/core'
import { CopilotService, ICopilot } from '@metad/copilot'
import type { AxiosRequestConfig } from 'axios'
import { Configuration, CreateCompletionRequest, CreateEditRequest, OpenAIApi } from 'openai'
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

  configuration: Configuration
  openai: OpenAIApi

  constructor() {
    super()

    // Init copilot config
    this.#copilotConfigFactory().then((copilot) => {
      console.log(copilot)
      this.copilot = copilot
      this.configuration = new Configuration({
        apiKey: copilot.apiKey
      })
      this.openai = new OpenAIApi(this.configuration)
      this._copilot$.next(copilot)
    })
  }

  async createCompletion(
    prompt: string,
    options?: { completionRequest?: CreateCompletionRequest; axiosConfig?: AxiosRequestConfig }
  ) {
    const { completionRequest, axiosConfig } = options ?? {}
    const completion = await this.openai.createCompletion(
      {
        model: 'text-davinci-003',
        prompt: prompt,
        temperature: 0.6,
        max_tokens: 1000,
        ...(completionRequest ?? {})
      },
      // 由于本项目用到 Axios 与 openAi APi 中用到的 Axios 版本不一样，导致 AxiosRequestConfig 中的 method 类型有所不同
      axiosConfig as any
    )

    return completion.data.choices
  }

  async createEdit(editRequest: Partial<CreateEditRequest>) {
    const edit = await this.openai.createEdit({
      ...editRequest,
      model: 'code-davinci-edit-001'
    } as CreateEditRequest)

    return edit.data.choices
  }
}
