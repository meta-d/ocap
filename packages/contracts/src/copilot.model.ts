import { AiProvider } from "./ai.model"
import { IBasePerTenantAndOrganizationEntityModel } from "./base-entity.model"

export interface ICopilot extends IBasePerTenantAndOrganizationEntityModel {
  role: AiProviderRole
  enabled?: boolean
  provider?: AiProvider
  apiKey?: string
  apiHost?: string
  defaultModel?: string

  showTokenizer?: boolean

  /**
   * Details config for openai api
   */
  options?: any
}

export enum AiProviderRole {
  Primary = 'primary',
  Secondary ='secondary',
  Embedding = 'Embedding'
}