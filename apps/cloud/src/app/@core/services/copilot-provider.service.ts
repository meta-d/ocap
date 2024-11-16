import { inject, Injectable } from '@angular/core'
import { OrganizationBaseCrudService } from '@metad/cloud/state'
import { NGXLogger } from 'ngx-logger'
import { API_COPILOT_PROVIDER } from '../constants/app.constants'
import { ICopilotProvider, ICopilotProviderModel } from '../types'

@Injectable({ providedIn: 'root' })
export class CopilotProviderService extends OrganizationBaseCrudService<ICopilotProvider> {
  readonly #logger = inject(NGXLogger)

  constructor() {
    super(API_COPILOT_PROVIDER)
  }

  getModel(providerId: string, modelId: string) {
    return this.httpClient.get<ICopilotProviderModel>(this.apiBaseUrl + `/${providerId}/model/${modelId}`)
  }
}

export function injectCopilotProviderService() {
  return inject(CopilotProviderService)
}