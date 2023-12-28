import { inject, Injectable, InjectionToken } from '@angular/core'
import { CopilotService, ICopilot } from '@metad/copilot'
import { RequestOptions } from 'ai'
import { Store } from './store.service'

@Injectable({ providedIn: 'root' })
export class PACCopilotService extends CopilotService {
  readonly #store = inject(Store)

  static CopilotConfigFactoryToken = new InjectionToken<() => Promise<ICopilot>>('CopilotConfigFactoryToken')

  #copilotConfigFactory: () => Promise<ICopilot> = inject(PACCopilotService.CopilotConfigFactoryToken)

  constructor() {
    super()

    // Init copilot config
    this.#copilotConfigFactory().then((copilot) => {
      this.copilot = {
        ...copilot,
        chatUrl: '/api/ai/chat'
      }
    })
  }

  requestOptions(): RequestOptions {
    return {
      headers: {
        'Organization-Id': `${this.#store.selectedOrganization?.id}`,
        Authorization: `Bearer ${this.#store.token}`
      }
    }
  }
}
