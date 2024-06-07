import { AiBusinessRole, AiProvider } from './ai.model'
import { IBasePerTenantEntityModel } from './base-entity.model'

/**
 * Examples for copilot, which is used to few shot user question
 */
export interface ICopilotExample extends IBasePerTenantEntityModel {
  provider?: AiProvider
  role?: AiBusinessRole | string
  command?: string
  input?: string
  output?: string

  // Has vector
  vector?: boolean
}
