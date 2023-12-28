import { Injectable, InjectionToken, inject } from '@angular/core'
import { CopilotService, ICopilot } from '@metad/copilot'
import { RequestOptions } from 'ai'

@Injectable()
export class NgmClientCopilotService extends CopilotService {
  static CopilotConfigFactoryToken = new InjectionToken<() => Promise<ICopilot>>('CopilotConfigFactoryToken')

  #copilotConfigFactory: () => Promise<ICopilot> = inject(NgmClientCopilotService.CopilotConfigFactoryToken)

  constructor() {
    super()

    // Init copilot config
    this.#copilotConfigFactory().then((copilot) => {
      this.copilot = copilot
    })
  }

  override requestOptions(): RequestOptions {
    return {
      headers: {
        Authorization: `Bearer ${this.copilot.apiKey}`
      }
    }
  }
}
