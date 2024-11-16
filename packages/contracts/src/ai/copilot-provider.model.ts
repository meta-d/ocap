import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { IAiProviderEntity } from './ai-model.model'
import { ICopilot } from './copilot.model'

export interface ICopilotProvider extends IBasePerTenantAndOrganizationEntityModel {
  providerName?: string
  providerType?: string
  encryptedConfig?: Record<string, any>
  isValid?: boolean
  lastUsed?: Date
  quotaType?: string
  quotaLimit?: number
  quotaUsed?: number

  /**
   */
  options?: any

  copilot?: ICopilot
  copilotId?: string

  models?: ICopilotProviderModel[]

  // Temporary properties
  provider?: IAiProviderEntity
}


export interface ICopilotProviderModel extends IBasePerTenantAndOrganizationEntityModel {
  providerName?: string
  modelName?: string
  modelType?: string
  encryptedConfig?: Record<string, any>
  isValid?: boolean

  // Many to one
  provider?: ICopilotProvider
  providerId?: string

  // Temporary properties
}
