import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { NgmCopilotService } from '@metad/ocap-angular/copilot'
import { RequestOptions } from 'ai'
import { Store } from './store.service'

@Injectable({ providedIn: 'root' })
export class PACCopilotService extends NgmCopilotService {
  private httpClient = inject(HttpClient)
  readonly #store = inject(Store)

  #tokenSub = this.#store.token$.subscribe((token) => {
    this.copilot = {
      ...this.copilot,
      token
    }
  })

  requestOptions(): RequestOptions {
    return {
      headers: {
        'Organization-Id': `${this.#store.selectedOrganization?.id}`
      }
    }
  }
}
