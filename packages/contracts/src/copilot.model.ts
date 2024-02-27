import { IBasePerTenantAndOrganizationEntityModel } from "./base-entity.model"

export interface ICopilot extends IBasePerTenantAndOrganizationEntityModel {
  enabled?: boolean
  provider?: string
  apiKey?: string
  apiHost?: string
  defaultModel?: string

  showTokenizer?: boolean

  /**
   * Details config for openai api
   */
  options?: any
}
