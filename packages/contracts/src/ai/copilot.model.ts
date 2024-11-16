import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { AiProvider } from './ai.model'

export interface ICopilot extends IBasePerTenantAndOrganizationEntityModel {
  role: AiProviderRole
  enabled?: boolean
  provider?: AiProvider
  apiKey?: string
  apiHost?: string
  defaultModel?: string

  showTokenizer?: boolean
  /**
   * Balance of Token 
   */
  tokenBalance?: number

  /**
   * Details config for openai api
   */
  options?: any
}

/**
 * The order of priority is: `Embedding`, `Secondary`, `Primary`
 */
export enum AiProviderRole {
  Primary = 'primary',
  Secondary = 'secondary',
  Embedding = 'embedding',
}
